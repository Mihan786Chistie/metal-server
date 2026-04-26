import { IsBoolean, IsJSON, IsString, IsUrl, MaxLength, MinLength } from "class-validator";
import { MessageLayout } from "../entities/alert.entity";

export class CreateAlertDto {

    @IsString()
    id: string;

    @IsString()
    @MinLength(3)
    @MaxLength(50)
    name: string;

    @IsUrl()
    href: string;

    updatedAt: Date;

    updatedBy: string;

    @IsString()
    alertType: string;

    @IsString()
    recipientType: string;

    @IsString()
    recipients: string;

    @IsBoolean()
    enabled: boolean;

    @IsString()
    integrationId: string;

    @IsJSON()
    messageLayout: MessageLayout[];

}
