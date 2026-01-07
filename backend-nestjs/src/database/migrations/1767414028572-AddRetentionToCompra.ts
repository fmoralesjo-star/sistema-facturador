import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRetentionToCompra1767414028572 implements MigrationInterface {
    name = 'AddRetentionToCompra1767414028572'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "compras" ADD "retencion_renta_codigo" character varying(10)`);
        await queryRunner.query(`ALTER TABLE "compras" ADD "retencion_renta_porcentaje" numeric(5,2) DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "compras" ADD "retencion_renta_valor" numeric(10,2) DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "compras" ADD "retencion_iva_codigo" character varying(10)`);
        await queryRunner.query(`ALTER TABLE "compras" ADD "retencion_iva_porcentaje" numeric(5,2) DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "compras" ADD "retencion_iva_valor" numeric(10,2) DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "compras" DROP COLUMN "retencion_iva_valor"`);
        await queryRunner.query(`ALTER TABLE "compras" DROP COLUMN "retencion_iva_porcentaje"`);
        await queryRunner.query(`ALTER TABLE "compras" DROP COLUMN "retencion_iva_codigo"`);
        await queryRunner.query(`ALTER TABLE "compras" DROP COLUMN "retencion_renta_valor"`);
        await queryRunner.query(`ALTER TABLE "compras" DROP COLUMN "retencion_renta_porcentaje"`);
        await queryRunner.query(`ALTER TABLE "compras" DROP COLUMN "retencion_renta_codigo"`);
    }

}
