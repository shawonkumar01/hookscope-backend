import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookRequest } from './request.entity';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { EndpointsModule } from '../endpoints/endpoints.module';

@Module({
  imports: [TypeOrmModule.forFeature([WebhookRequest]), EndpointsModule],
  providers: [RequestsService],
  controllers: [RequestsController],
  exports: [RequestsService],
})
export class RequestsModule {}
