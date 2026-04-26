import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertEvent } from 'src/alerts/entities/alert-event.entity';
import {
  MessageLayout,
  MessageField,
  ActionButton,
} from 'src/alerts/entities/alert.entity';


interface SlackTextObject {
  type: 'plain_text' | 'mrkdwn';
  text: string;
  emoji?: boolean;
}

interface SlackHeaderBlock {
  type: 'header';
  text: SlackTextObject;
}

interface SlackSectionBlock {
  type: 'section';
  text?: SlackTextObject;
  fields?: SlackTextObject[];
}

interface SlackButtonElement {
  type: 'button';
  text: SlackTextObject;
  style?: 'primary' | 'danger';
  action_id: string;
  value: string;
}

interface SlackActionsBlock {
  type: 'actions';
  elements: SlackButtonElement[];
}

type SlackBlock = SlackHeaderBlock | SlackSectionBlock | SlackActionsBlock;

import { IntegrationService } from 'src/integration/integration.service';

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);

  constructor(
    @InjectRepository(AlertEvent)
    private readonly alertEventRepository: Repository<AlertEvent>,
    private readonly integrationService: IntegrationService,
  ) { }

  async getChannels(userId: string) {
    const integration = await this.integrationService.findOneDecryptedByUserId(userId);
    if (!integration?.slackBotToken) return [];

    const response = await fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel&limit=1000', {
      headers: {
        Authorization: `Bearer ${integration.slackBotToken}`
      }
    });
    const data = await response.json();
    if (!data.ok) return [];

    return data.channels.map(c => ({ id: c.id, name: c.name, type: 'channel' }));
  }

  async getUsers(userId: string) {
    const integration = await this.integrationService.findOneDecryptedByUserId(userId);
    if (!integration?.slackBotToken) return [];

    const response = await fetch('https://slack.com/api/users.list?limit=1000', {
      headers: {
        Authorization: `Bearer ${integration.slackBotToken}`
      }
    });
    const data = await response.json();
    if (!data.ok) return [];

    return data.members
      .filter(m => !m.deleted && !m.is_bot)
      .map(m => ({ id: m.id, name: m.profile.real_name || m.name, type: 'user' }));
  }


  buildSlackBlocks(
    eventData: Record<string, any>,
    layout: MessageLayout,
    alertEventId: string,
  ): SlackBlock[] {
    const blocks: SlackBlock[] = [];

    if (layout.header?.title) {
      blocks.push({
        type: 'header',
        text: {
          type: 'plain_text',
          text: layout.header.title,
          emoji: true,
        },
      });
    }

    if (layout.sections?.length) {
      layout.sections.forEach((field: MessageField) => {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${field.key}:* ${this.resolveValue(eventData, field.value)}`,
          },
        });
      });
    }

    if (layout.buttons?.length) {
      const elements: SlackButtonElement[] = layout.buttons.map(
        (btn: ActionButton) => ({
          type: 'button' as const,
          text: {
            type: 'plain_text' as const,
            text: btn.label,
            emoji: true,
          },
          style: this.buttonStyle(btn.type),
          action_id: this.actionId(btn.type, btn.id),
          value: alertEventId,
        }),
      );

      blocks.push({ type: 'actions', elements });
    }

    return blocks;
  }

  async sendMessage(
    token: string,
    channel: string,
    blocks: SlackBlock[],
    text = 'New alert from Metal',
  ): Promise<any> {
    try {
      const resolvedChannel = await this.ensureChannel(token, channel);

      const response = await this.safeFetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channel: resolvedChannel, blocks, text }),
      });

      const data = await response.json();

      if (!data.ok) {
        this.logger.error(`Slack postMessage failed: ${data.error}`, {
          channel: resolvedChannel,
          error: data.error,
        });
      } else {
        this.logger.log(`Message sent to ${resolvedChannel}`);
      }

      return data;
    } catch (error) {
      this.logger.error(`Failed to send message: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async safeFetch(url: string, options: RequestInit, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(id);
    }
  }

  private async ensureChannel(token: string, target: string): Promise<string> {
    try {
      if (target.startsWith('U')) {
        const res = await this.safeFetch('https://slack.com/api/conversations.open', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ users: target }),
        });
        const data = await res.json();
        if (data.ok && data.channel?.id) {
          this.logger.log(`Opened DM channel ${data.channel.id} for user ${target}`);
          return data.channel.id;
        }
        this.logger.error(`Failed to open DM for ${target}: ${data.error}`);
        return target;
      }

      if (target.startsWith('C')) {
        const res = await this.safeFetch('https://slack.com/api/conversations.join', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ channel: target }),
        });
        const data = await res.json();
        if (data.ok) {
          this.logger.log(`Bot joined channel ${target}`);
        } else if (data.error !== 'already_in_channel') {
          this.logger.error(`Failed to join channel ${target}: ${data.error}`);
        }
      }
    } catch (error) {
      this.logger.warn(`Could not ensure channel ${target}: ${error.message}`);
    }

    return target;
  }

  async respondToInteraction(
    responseUrl: string,
    message: string,
    replaceOriginal = false,
  ): Promise<void> {
    await fetch(responseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message,
        replace_original: replaceOriginal,
      }),
    });
  }

  async handleInteraction(payload: any): Promise<void> {
    const action = payload.actions?.[0];
    if (!action) {
      this.logger.warn('Interaction payload with no actions');
      return;
    }

    const { action_id, value: alertEventId } = action;
    const slackUserId = payload.user?.id ?? 'unknown';
    const responseUrl = payload.response_url;

    if (action_id === 'ack_alert') {
      await this.acknowledgeAlert(alertEventId, slackUserId);

      if (responseUrl) {
        await this.respondToInteraction(
          responseUrl,
          `✅ Alert acknowledged by <@${slackUserId}>`,
        );
      }
    } else {
      this.logger.warn(`Unhandled action_id: ${action_id}`);
    }
  }

  private async acknowledgeAlert(
    alertEventId: string,
    slackUserId: string,
  ): Promise<void> {
    await this.alertEventRepository.update(alertEventId, {
      acknowledged: true,
      acknowledgedBy: slackUserId,
      acknowledgedAt: new Date(),
    });

    this.logger.log(
      `Alert event ${alertEventId} acknowledged by ${slackUserId}`,
    );
  }

  private resolveValue(data: Record<string, any>, path: string): string {
    // Some OM payloads have a stringified 'entity' field. 
    // If the path starts with 'entity.', we try to parse it.
    let sourceData = data;
    if (path.startsWith('entity.') && typeof data.entity === 'string') {
      try {
        const parsedEntity = JSON.parse(data.entity);
        sourceData = { ...data, entity: parsedEntity };
      } catch (e) {
        // Fallback to original data if parsing fails
      }
    }

    const value = path
      .split('.')
      .reduce(
        (obj, key) => (obj != null ? obj[key] : undefined),
        sourceData as any,
      );

    if (value === undefined || value === null) return '_N/A_';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  }

  private buttonStyle(type: string): 'primary' | 'danger' {
    switch (type) {
      case 'ack':
        return 'primary';
      case 'ai':
        return 'primary';
      case 'link':
        return 'primary';
      default:
        return 'primary';
    }
  }

  private actionId(type: string, buttonId: string): string {
    switch (type) {
      case 'ack':
        return 'ack_alert';
      default:
        return `${type}_alert_${buttonId}`;
    }
  }
}
