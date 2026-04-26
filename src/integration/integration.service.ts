import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Integration } from './entities/integration.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { decrypt } from './util/crypt';

@Injectable()
export class IntegrationService {
  constructor(
    @InjectRepository(Integration)
    private integrationRepository: Repository<Integration>,
  ) { }

  private async create(userId: string, createIntegrationDto: UpdateIntegrationDto) {
    const integration = this.integrationRepository.create({
      ...createIntegrationDto,
      user: {
        id: userId,
      },
    });
    return await this.integrationRepository.save(integration);
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

  async findOneDecrypted(userId: string, id: string) {
    const integration = await this.findOne(userId, id);
    return {
      id: integration.id,
      slackTeamId: integration.slackTeamId,
      omBotToken: integration.omBotToken ? decrypt(integration.omBotToken) : null,
      slackBotToken: integration.slackBotToken ? decrypt(integration.slackBotToken) : null,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
    };
  }

  async findOneDecryptedByUserId(userId: string) {
    const integration = await this.integrationRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });
    if (!integration)
      throw new NotFoundException(`Integration not found`);
    return {
      id: integration.id,
      slackTeamId: integration.slackTeamId,
      omBotToken: integration.omBotToken ? decrypt(integration.omBotToken) : null,
      slackBotToken: integration.slackBotToken ? decrypt(integration.slackBotToken) : null,
    };
  }

  async update(
    userId: string,
    id: string,
    updateIntegrationDto: UpdateIntegrationDto,
  ) {
    const integration = await this.findOne(userId, id);
    Object.assign(integration, updateIntegrationDto);
    return await this.integrationRepository.save(integration);
  }

  async remove(userId: string, id: string) {
    const integration = await this.findOne(userId, id);
    await this.integrationRepository.remove(integration);
    return { deleted: true };
  }

  async slackCallback(code: string, userId: string) {
    const configService = new ConfigService();
    const slackOAuthURL = configService.getOrThrow('SLACK_OAUTH_API_URL')
    const client_id = configService.getOrThrow('SLACK_CLIENT_ID')
    const client_secret = configService.getOrThrow('SLACK_CLIENT_SECRET')
    const redirect_uri = configService.getOrThrow('SLACK_REDIRECT_URL')
    const response = await fetch(`${slackOAuthURL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `code=${code}&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect_uri}`,
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error('Slack OAuth failed');
    }

    const {
      access_token,
      team,
    } = data;

    await this.upsert(userId, {
      slackBotToken: access_token,
      slackTeamId: team.id,
    })

  }

  async findOneDecryptedById(integrationId: string) {
    const integration = await this.integrationRepository.findOne({
      where: { id: integrationId },
    });
    if (!integration) return null;
    return {
      id: integration.id,
      slackTeamId: integration.slackTeamId,
      omBotToken: integration.omBotToken ? decrypt(integration.omBotToken) : null,
      slackBotToken: integration.slackBotToken ? decrypt(integration.slackBotToken) : null,
    };
  }

  async upsert(userId: string, data: Partial<Integration>) {
    const integration = await this.integrationRepository.findOne({
      where: {
        user: {
          id: userId,
        }
      }
    });
    if (!integration) {
      return this.create(userId, data);
    }
    return this.update(userId, integration.id, data);
  }
}
