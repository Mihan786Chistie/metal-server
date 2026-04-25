import { IsNotEmpty, IsString } from 'class-validator';

export class CreateIntegrationDto {

    @IsString()
    @IsNotEmpty()
    omBotToken: string;

    @IsString()
    @IsNotEmpty()
    slackTeamId: string;

    @IsString()
    @IsNotEmpty()
    slackBotToken: string;
}
