import { Controller, Post, Get, Req, Res, Logger, UseGuards } from '@nestjs/common';
import { SlackService } from './slack.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request, Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('slack')
export class SlackController {
  private readonly logger = new Logger(SlackController.name);

  constructor(private readonly slackService: SlackService) { }

  @Get('channels')
  getChannels(@Req() req: any) {
    return this.slackService.getChannels(req.user.id);
  }

  @Get('users')
  getUsers(@Req() req: any) {
    return this.slackService.getUsers(req.user.id);
  }

  @Public()
  @Post('interactions')
  async handleInteraction(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {

    res.status(200).send();

    try {
      const payload = JSON.parse(req.body?.payload ?? '{}');
      this.logger.log(
        `Interaction received: type=${payload.type}, action=${payload.actions?.[0]?.action_id}`,
      );

      if (payload.type === 'block_actions') {
        await this.slackService.handleInteraction(payload);
      }
    } catch (error) {
      this.logger.error('Failed to handle Slack interaction', error);
    }
  }
}
