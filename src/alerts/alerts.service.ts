import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Alert, RecipientType } from './entities/alert.entity';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { IntegrationService } from 'src/integration/integration.service';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    private readonly configService: ConfigService,
    private readonly integrationService: IntegrationService,
  ) { }

  async create(userId: string, createAlertDto: CreateAlertDto, id: string) {

    const integration = await this.integrationService.findOneDecryptedByUserId(userId);

    const response = await fetch(`${this.configService.getOrThrow('OM_API_URL')}/events/subscriptions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${integration.omBotToken}`,
      },
    });

    if (!response.ok) {
      throw new BadRequestException('OpenMetadata alert fetch failed');
    }

    const omData = await response.json();

    const matchingAlert = omData.data.find((a: any) => a.id === id);

    if (!matchingAlert) {
      throw new BadRequestException(`Alert with ID ${id} not found in OpenMetadata`);
    }

    const alert = this.alertRepository.create({
      ...createAlertDto,
      id,
      name: matchingAlert.displayName || matchingAlert.name,
      href: matchingAlert.href,
      updatedAt: new Date(matchingAlert.updatedAt),
      updatedBy: matchingAlert.updatedBy,
      alertType: matchingAlert.alertType,
      integrationId: integration.id,
      recipientType: createAlertDto.recipientType as RecipientType
    });

    const newDestination = [
      {
        "op": "replace",
        "path": "/destinations/0/config/endpoint",
        "value": this.configService.getOrThrow('METAL_API_URL') + '/webhook/' + id
      }
    ]

    const alertUpdateResponse = await fetch(`${this.configService.getOrThrow('OM_API_URL')}/events/subscriptions/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${integration.omBotToken}`,
        'Content-Type': 'application/json-patch+json',
      },
      body: JSON.stringify(newDestination),
    });

    if (!alertUpdateResponse.ok) {
      throw new BadRequestException('Failed to update alert');
    }

    return await this.alertRepository.save(alert);
  }

  async findAllFromOM(userId: string) {
    const integration = await this.integrationService.findOneDecryptedByUserId(userId);
    if (!integration || !integration.omBotToken) {
      throw new BadRequestException('OpenMetadata integration not configured');
    }

    const response = await fetch(`${this.configService.getOrThrow('OM_API_URL')}/events/subscriptions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${integration.omBotToken}`,
      },
    });

    if (!response.ok) {
      throw new BadRequestException('OpenMetadata alert fetch failed');
    }

    const omData = await response.json();

    // Fetch local alerts to check if they are saved in our DB
    const localAlerts = await this.alertRepository.find({
      where: { integrationId: integration.id }
    });
    // Map local alerts for easy lookup of their enabled status
    const localAlertMap = new Map(localAlerts.map(a => [a.id, a.enabled]));

    return omData.data.map((alert: any) => ({
      id: alert.id,
      name: alert.displayName || alert.name,
      alertType: alert.alertType,
      // Use local DB enabled status if saved, otherwise default to false
      enabled: localAlertMap.get(alert.id) ?? false,
      destinations: alert.destinations,
      href: alert.href,
    }));
  }

  async disable(userId: string, id: string) {
    const integration = await this.integrationService.findOneDecryptedByUserId(userId);

    const patchPayload = [
      {
        "op": "replace",
        "path": "/enabled",
        "value": false
      }
    ];

    const response = await fetch(`${this.configService.getOrThrow('OM_API_URL')}/events/subscriptions/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${integration.omBotToken}`,
        'Content-Type': 'application/json-patch+json',
      },
      body: JSON.stringify(patchPayload),
    });

    if (!response.ok) {
      throw new BadRequestException('Failed to disable alert in OpenMetadata');
    }

    const alert = await this.alertRepository.findOne({ where: { id } });
    if (alert) {
      alert.enabled = false;
      await this.alertRepository.save(alert);
    }

    return { success: true };
  }

  async findOne(id: string) {

    return await this.alertRepository.findOne({
      where: {
        id
      }
    });
  }
}
