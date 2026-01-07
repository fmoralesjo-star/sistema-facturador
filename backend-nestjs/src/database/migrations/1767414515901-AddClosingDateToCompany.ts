import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClosingDateToCompany1767414515901 implements MigrationInterface {
    name = 'AddClosingDateToCompany1767414515901'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_companies" ADD "fecha_cierre_contable" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_companies" DROP COLUMN "fecha_cierre_contable"`);
    }

}
