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
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { IntegrationService } from './integration.service';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) { }

  @Get()
  findUserIntegration(@Req() req) {
    return this.integrationService.findOneDecryptedByUserId(req.user.id);
  }

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
  async slackCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    await this.integrationService.slackCallback(code, state);
    return res.redirect('http://localhost:3001/dashboard/integrations');
  }

  @Post('/open-metadata')
  saveOpenMetadataToken(@Body() body: any, @Req() req) {
    return this.integrationService.upsert(req.user.id, body);
  }
}
