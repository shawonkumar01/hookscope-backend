import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { WebhookRequest } from './request.entity';
import { ReplayDto } from './dto/replay.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(WebhookRequest)
    private repo: Repository<WebhookRequest>,
  ) {}

  async create(data: {
    endpointId: string;
    method: string;
    headers: Record<string, string>;
    body: string | null;
    sourceIp: string | null;
    contentType: string | null;
  }): Promise<WebhookRequest> {
    const request = this.repo.create(data);
    return this.repo.save(request);
  }

  async findByEndpoint(endpointId: string): Promise<WebhookRequest[]> {
    return this.repo.find({
      where: { endpointId },
      order: { receivedAt: 'DESC' },
      take: 100,
    });
  }

  async findOne(id: string): Promise<WebhookRequest> {
    const request = await this.repo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Request not found');
    return request;
  }

  async clearByEndpoint(endpointId: string): Promise<void> {
    await this.repo.delete({ endpointId });
  }

  async replay(
    id: string,
    dto: ReplayDto,
  ): Promise<{
    status: number;
    headers: Record<string, string>;
    body: string;
    replayedTo: string;
  }> {
    // 1. Load the original request
    const original = await this.findOne(id);

    // 2. Decide target URL
    const targetUrl = dto.targetUrl ?? this.buildOriginalUrl(original);

    // 3. Clean headers — remove ones that cause issues when replaying
    const headers = this.cleanHeaders(original.headers);

    // 4. Fire the request
    try {
      const response = await axios({
        method: original.method.toLowerCase(),
        url: targetUrl,
        headers,
        data: original.body ?? undefined,
        validateStatus: () => true, // don't throw on 4xx/5xx
        timeout: 10000,
      });

      return {
        status: response.status,
        headers: response.headers as Record<string, string>,
        body:
          typeof response.data === 'object'
            ? JSON.stringify(response.data)
            : String(response.data),
        replayedTo: targetUrl,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Replay failed: ${error.message}`);
      }

      throw new Error('Replay failed: Unknown error');
    }
  }

  private buildOriginalUrl(request: WebhookRequest): string {
    // fallback to localhost if no target provided
    const host = request.headers['host'] ?? 'localhost:3001';
    return `http://${host}/hook/${request.endpointId}`;
  }

  private cleanHeaders(
    headers: Record<string, string>,
  ): Record<string, string> {
    // these headers cause issues when forwarding
    const blocked = [
      'host',
      'content-length',
      'connection',
      'accept-encoding',
      'postman-token',
      'cache-control',
    ];

    return Object.fromEntries(
      Object.entries(headers).filter(
        ([key]) => !blocked.includes(key.toLowerCase()),
      ),
    );
  }
}
