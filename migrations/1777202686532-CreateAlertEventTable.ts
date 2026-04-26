import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAlertEventTable1777202686532 implements MigrationInterface {
    name = 'CreateAlertEventTable1777202686532'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "alert_event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "alertId" character varying NOT NULL, "eventPayload" jsonb NOT NULL, "acknowledged" boolean NOT NULL DEFAULT false, "acknowledgedBy" character varying, "acknowledgedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1c7366edb86d2fff4713e74c6eb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "alert_event" ADD CONSTRAINT "FK_49920ddaae6e34690adf7d856ee" FOREIGN KEY ("alertId") REFERENCES "om_alert"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alert_event" DROP CONSTRAINT "FK_49920ddaae6e34690adf7d856ee"`);
        await queryRunner.query(`DROP TABLE "alert_event"`);
    }

}
