import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { EndpointsService } from '../endpoints/endpoints.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReplayDto } from './dto/replay.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class RequestsController {
  constructor(
    private requests: RequestsService,
    private endpoints: EndpointsService,
  ) {}

  // GET /endpoints/:id/requests
  @Get('endpoints/:id/requests')
  async findAll(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    await this.endpoints.findOneOwned(id, user.id);
    return this.requests.findByEndpoint(id);
  }

  // GET /requests/:id
  @Get('requests/:id')
  findOne(@Param('id') id: string) {
    return this.requests.findOne(id);
  }

  // POST /requests/:id/replay
  @Post('requests/:id/replay')
  async replay(
    @Param('id') id: string,
    @Body() dto: ReplayDto,
  ) {
    return this.requests.replay(id, dto);
  }

  // DELETE /endpoints/:id/requests
  @Delete('endpoints/:id/requests')
  async clear(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    await this.endpoints.findOneOwned(id, user.id);
    await this.requests.clearByEndpoint(id);
    return { message: 'Request history cleared' };
  }
}