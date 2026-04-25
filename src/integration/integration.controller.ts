import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';

@Controller('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Post()
  create(@Req() req, @Body() createIntegrationDto: CreateIntegrationDto) {
    return this.integrationService.create(req.user.id, createIntegrationDto);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.integrationService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateIntegrationDto: UpdateIntegrationDto,
  ) {
    return this.integrationService.update(
      req.user.id,
      id,
      updateIntegrationDto,
    );
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.integrationService.remove(req.user.id, id);
  }
}
