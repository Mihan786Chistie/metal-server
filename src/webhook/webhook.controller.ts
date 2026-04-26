import { Controller, Post, Body, Logger, HttpCode, Param } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) { }

  @Public()
  @Post(':alertId')
  @HttpCode(200)
  async handleWebhook(
    @Param('alertId') alertId: string,
    @Body() body: any,
  ): Promise<{ received: boolean }> {
    this.logger.log(`Webhook received for alert: ${alertId}`);

    this.webhookService.processEvent(alertId, body).catch((error) => {
      this.logger.error('Webhook processing failed', error);
    });

    return { received: true };
  }
}
