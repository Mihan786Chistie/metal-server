import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateIntegrationTable1777114249946 implements MigrationInterface {
    name = 'CreateIntegrationTable1777114249946'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "integration" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "omBotToken" character varying NOT NULL, "slackTeamId" character varying NOT NULL, "slackBotToken" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "REL_e38baca49ddff880b963fcb5d0" UNIQUE ("userId"), CONSTRAINT "PK_f348d4694945d9dc4c7049a178a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "integration" ADD CONSTRAINT "FK_e38baca49ddff880b963fcb5d08" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "integration" DROP CONSTRAINT "FK_e38baca49ddff880b963fcb5d08"`);
        await queryRunner.query(`DROP TABLE "integration"`);
    }

}
