import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './entities/alert.entity';
import { IntegrationModule } from 'src/integration/integration.module';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alert]),
    IntegrationModule
  ],
  controllers: [AlertsController],
  providers: [AlertsService],
})
export class AlertsModule { }
