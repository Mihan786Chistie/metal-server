import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Integration } from './entities/integration.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IntegrationService {
  constructor(
    @InjectRepository(Integration)
    private integrationRepository: Repository<Integration>,
  ) {}
  async create(userId: string, createIntegrationDto: CreateIntegrationDto) {
    return await this.integrationRepository.save({
      ...createIntegrationDto,
      user: {
        id: userId,
      },
    });
  }

  async findOne(userId: string, id: string) {
    const integration = await this.integrationRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        id,
      },
    });
    if (!integration)
      throw new NotFoundException(`Integration ${id} not found`);
    return integration;
  }

  async update(
    userId: string,
    id: string,
    updateIntegrationDto: UpdateIntegrationDto,
  ) {
    await this.findOne(userId, id);
    return await this.integrationRepository.update(
      {
        id,
        user: {
          id: userId,
        },
      },
      updateIntegrationDto,
    );
  }

  async remove(userId: string, id: string) {
    const integration = await this.findOne(userId, id);
    await this.integrationRepository.remove(integration);
    return { deleted: true };
  }
}
