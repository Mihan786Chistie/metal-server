import { IsOptional, IsString } from 'class-validator';

export class CreateIntegrationDto {

    @IsString()
    @IsOptional()
    omBotToken: string;

    @IsString()
    @IsOptional()
    slackTeamId: string;

    @IsString()
    @IsOptional()
    slackBotToken: string;
}
