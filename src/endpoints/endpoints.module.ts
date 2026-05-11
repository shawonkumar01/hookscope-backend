import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Endpoint } from './endpoint.entity';
import { EndpointsService } from './endpoints.service';
import { EndpointsController } from './endpoints.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Endpoint])],
  providers: [EndpointsService],
  controllers: [EndpointsController],
  exports: [EndpointsService],
})
export class EndpointsModule {}
