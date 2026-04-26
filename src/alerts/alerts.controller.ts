import { Controller, Get, Post, Body, Param, Req, UseGuards, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) { }

  @Post('config')
  create(@Req() req, @Body() createAlertDto: CreateAlertDto, @Query('id') id: string) {
    return this.alertsService.create(req.user.id, createAlertDto, id);
  }

  @Get()
  findAll(@Req() req) {
    return this.alertsService.findAllFromOM(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertsService.findOne(id);
  }

  @Post(':id/disable')
  disable(@Req() req, @Param('id') id: string) {
    return this.alertsService.disable(req.user.id, id);
  }
}
