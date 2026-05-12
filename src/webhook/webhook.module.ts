import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookGateway } from './webhook.gateway';
import { EndpointsModule } from '../endpoints/endpoints.module';
import { RequestsModule } from '../requests/requests.module';

@Module({
  imports: [EndpointsModule, RequestsModule],
  controllers: [WebhookController],
  providers: [WebhookGateway],
})
export class WebhookModule {}