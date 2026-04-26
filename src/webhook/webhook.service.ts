import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertsService } from 'src/alerts/alerts.service';
import { IntegrationService } from 'src/integration/integration.service';
import { SlackService } from 'src/slack/slack.service';
import { AlertEvent } from 'src/alerts/entities/alert-event.entity';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly alertsService: AlertsService,
    private readonly integrationService: IntegrationService,
    private readonly slackService: SlackService,
    @InjectRepository(AlertEvent)
    private readonly alertEventRepository: Repository<AlertEvent>,
  ) { }

  async processEvent(alertId: string, omPayload: any): Promise<void> {
    this.logger.log(`Processing webhook for alert: ${alertId}`);

    const alert = await this.alertsService.findOne(alertId);

    if (!alert) {
      this.logger.warn(`No alert config found for: ${alertId}`);
      return;
    }

    const integration = await this.integrationService.findOneDecryptedById(
      alert.integrationId,
    );

    if (!integration?.slackBotToken) {
      this.logger.error(`No Slack token found for integration: ${alert.integrationId}`);
      return;
    }

    const layout = Array.isArray(alert.messageLayout)
      ? alert.messageLayout[0]
      : alert.messageLayout;

    if (!layout) {
      this.logger.warn(`Alert ${alert.id} has no messageLayout configured`);
      return;
    }

    const alertEvent = this.alertEventRepository.create({
      alertId: alert.id,
      eventPayload: omPayload,
    });
    const savedEvent = await this.alertEventRepository.save(alertEvent);

    const blocks = this.slackService.buildSlackBlocks(
      omPayload,
      layout,
      savedEvent.id,
    );

    const recipients = this.parseRecipients(alert.recipients);

    for (const recipient of recipients) {
      try {
        await this.slackService.sendMessage(
          integration.slackBotToken,
          recipient.trim(),
          blocks,
          `Alert: ${alert.name}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send to ${recipient}: ${error.message}`,
        );
      }
    }

    this.logger.log(
      `Webhook processed: alert=${alert.name}, event=${savedEvent.id}, recipients=${recipients.length}`,
    );
  }

  private parseRecipients(recipients: string): string[] {
    if (!recipients) return [];
    return recipients
      .split(',')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);
  }
}
