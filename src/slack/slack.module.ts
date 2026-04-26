import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackService } from './slack.service';
import { SlackController } from './slack.controller';
import { AlertEvent } from 'src/alerts/entities/alert-event.entity';
import { IntegrationModule } from 'src/integration/integration.module';

@Module({
  imports: [TypeOrmModule.forFeature([AlertEvent]), IntegrationModule],
  controllers: [SlackController],
  providers: [SlackService],
  exports: [SlackService],
})
export class SlackModule {}
