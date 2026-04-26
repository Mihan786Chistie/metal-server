import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { AlertsModule } from 'src/alerts/alerts.module';
import { IntegrationModule } from 'src/integration/integration.module';
import { SlackModule } from 'src/slack/slack.module';
import { AlertEvent } from 'src/alerts/entities/alert-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AlertEvent]),
    AlertsModule,
    IntegrationModule,
    SlackModule,
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
