import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookRequest } from './request.entity';

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
      take: 100, // max 100 per query
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
}
