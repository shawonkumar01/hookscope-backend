import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { EndpointsService } from '../endpoints/endpoints.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller()
export class RequestsController {
  constructor(
    private requests: RequestsService,
    private endpoints: EndpointsService,
  ) {}

  // GET /endpoints/:id/requests — list all requests for an endpoint
  @Get('endpoints/:id/requests')
  async findAll(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    // verify ownership first
    await this.endpoints.findOneOwned(id, user.id);
    return this.requests.findByEndpoint(id);
  }

  // GET /requests/:id — get one request detail
  @Get('requests/:id')
  findOne(@Param('id') id: string) {
    return this.requests.findOne(id);
  }

  // DELETE /endpoints/:id/requests — clear history
  @Delete('endpoints/:id/requests')
  async clear(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    await this.endpoints.findOneOwned(id, user.id);
    await this.requests.clearByEndpoint(id);
    return { message: 'Request history cleared' };
  }
}
