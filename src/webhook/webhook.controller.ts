import { Controller, All, Param, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { EndpointsService } from '../endpoints/endpoints.service';
import { RequestsService } from '../requests/requests.service';
import { RedisService } from '../common/redis/redis.service';

@Controller('hook')
export class WebhookController {
  constructor(
    private endpoints: EndpointsService,
    private requests: RequestsService,
    private redis: RedisService,
  ) {}

  @All(':slug')
  async receive(
    @Param('slug') slug: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // 1. Find endpoint by slug
    const endpoint = await this.endpoints.findBySlug(slug);
    if (!endpoint) {
      return res.status(404).json({ message: 'Endpoint not found' });
    }

    // 2. Extract body
    const body =
      typeof req.body === 'object'
        ? JSON.stringify(req.body)
        : (req.body ?? null);

    // 3. Extract IP
    const sourceIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      null;

    // 4. Save to database
    const saved = await this.requests.create({
      endpointId: endpoint.id,
      method: req.method,
      headers: req.headers as Record<string, string>,
      body,
      sourceIp,
      contentType: req.headers['content-type'] ?? null,
    });

    // 5. Publish to Redis → WebSocket gateway picks this up → browser updates live
    await this.redis.publish(`webhook:${slug}`, JSON.stringify(saved));
    console.log(`Published to channel: webhook:${slug}`);
    // 6. Return custom response
    return res
      .status(endpoint.responseStatus)
      .send(endpoint.responseBody ?? 'OK');
  }
}
