import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) { }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.integrationService.findOneDecrypted(req.user.id, id);
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

  @Public()
  @Get('/slack/callback')
  slackCallback(@Query('code') code: string, @Req() req) {
    return this.integrationService.slackCallback(code, req.user.id);
  }

  @Post('/open-metadata')
  saveOpenMetadataToken(@Body() body: any, @Req() req) {
    return this.integrationService.upsert(req.user.id, body);
  }
}
