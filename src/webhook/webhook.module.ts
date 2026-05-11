import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { EndpointsModule } from '../endpoints/endpoints.module';
import { RequestsModule } from '../requests/requests.module';

@Module({
  imports: [EndpointsModule, RequestsModule],
  controllers: [WebhookController],
})
export class WebhookModule {}
