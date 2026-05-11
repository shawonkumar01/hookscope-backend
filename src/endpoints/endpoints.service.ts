import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import { Endpoint } from './endpoint.entity';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
import { UpdateEndpointDto } from './dto/update-endpoint.dto';

@Injectable()
export class EndpointsService {
  constructor(
    @InjectRepository(Endpoint)
    private repo: Repository<Endpoint>,
  ) {}

  async create(userId: string, dto: CreateEndpointDto): Promise<Endpoint> {
    const slug = nanoid(12); // e.g. "V1StGXR8_Z5j"
    const endpoint = this.repo.create({
      name: dto.name,
      slug,
      responseStatus: dto.responseStatus ?? 200,
      responseBody: dto.responseBody ?? null,
      userId,
    });
    return this.repo.save(endpoint);
  }

  async findAllByUser(userId: string): Promise<Endpoint[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findBySlug(slug: string): Promise<Endpoint | null> {
    return this.repo.findOne({ where: { slug } });
  }

  async findOneOwned(id: string, userId: string): Promise<Endpoint> {
    const endpoint = await this.repo.findOne({ where: { id } });
    if (!endpoint) throw new NotFoundException('Endpoint not found');
    if (endpoint.userId !== userId)
      throw new ForbiddenException('Access denied');
    return endpoint;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateEndpointDto,
  ): Promise<Endpoint> {
    const endpoint = await this.findOneOwned(id, userId);
    Object.assign(endpoint, dto);
    return this.repo.save(endpoint);
  }

  async remove(id: string, userId: string): Promise<void> {
    const endpoint = await this.findOneOwned(id, userId);
    await this.repo.remove(endpoint);
  }
}
