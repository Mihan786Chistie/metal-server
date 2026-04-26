import { IsArray, IsString, ValidateNested } from "class-validator";
import { MessageLayout } from "../entities/alert.entity";

export class CreateAlertDto {

    @IsString()
    recipientType: string;

    @IsString()
    recipients: string;

    @IsArray()
    messageLayout: MessageLayout[];

    id?: string;
    name?: string;
    href?: string;
    updatedAt?: Date;
    updatedBy?: string;
    alertType?: string;
    enabled?: boolean;
    integrationId?: string;

}
