import { Module } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { IntegrationController } from './integration.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Integration } from './entities/integration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Integration])],
  controllers: [IntegrationController],
  providers: [IntegrationService],
})
export class IntegrationModule {}
