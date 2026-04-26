import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) { }

  @Post()
  create(@Req() req, @Body() createAlertDto: CreateAlertDto, @Query('id') id: string) {
    return this.alertsService.create(req.user.id, createAlertDto, id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertsService.findOne(id);
  }
}
