import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHashedRefreshTokenToUser1777091616480 implements MigrationInterface {
    name = 'AddHashedRefreshTokenToUser1777091616480'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "hashedRefreshToken" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "hashedRefreshToken"`);
    }

}
