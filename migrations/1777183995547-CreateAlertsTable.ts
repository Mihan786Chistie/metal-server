import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAlertsTable1777183995547 implements MigrationInterface {
    name = 'CreateAlertsTable1777183995547'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."om_alert_recipienttype_enum" AS ENUM('channel', 'user', 'group')`);
        await queryRunner.query(`CREATE TABLE "om_alert" ("id" character varying NOT NULL, "name" character varying NOT NULL, "href" character varying, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedBy" character varying NOT NULL, "alertType" character varying NOT NULL, "recipientType" "public"."om_alert_recipienttype_enum" NOT NULL, "recipients" character varying NOT NULL, "enabled" boolean NOT NULL DEFAULT false, "integrationId" character varying NOT NULL, "messageLayout" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "PK_404d7b7ad825d7fd702e0f34903" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "om_alert"`);
        await queryRunner.query(`DROP TYPE "public"."om_alert_recipienttype_enum"`);
    }

}
