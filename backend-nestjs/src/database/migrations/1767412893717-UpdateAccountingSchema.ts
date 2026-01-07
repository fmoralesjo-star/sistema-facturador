import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAccountingSchema1767412893717 implements MigrationInterface {
    name = 'UpdateAccountingSchema1767412893717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enforce Type existence first to avoid errors if re-running partially
        const checkType = await queryRunner.query(`SELECT 1 FROM pg_type WHERE typname = 'cuentas_contables_naturaleza_enum'`);
        if (checkType.length === 0) {
            await queryRunner.query(`CREATE TYPE "public"."cuentas_contables_naturaleza_enum" AS ENUM('DEUDORA', 'ACREEDORA')`);
        }

        // Add columns to cuentas_contables
        await queryRunner.query(`ALTER TABLE "cuentas_contables" ADD IF NOT EXISTS "naturaleza" "public"."cuentas_contables_naturaleza_enum" NOT NULL DEFAULT 'DEUDORA'`);
        await queryRunner.query(`ALTER TABLE "cuentas_contables" ADD IF NOT EXISTS "sri_codigo" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "cuentas_contables" ADD IF NOT EXISTS "requiere_auxiliar" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "cuentas_contables" ADD IF NOT EXISTS "requiere_centro_costo" boolean NOT NULL DEFAULT false`);

        // Add columns to partidas_contables
        await queryRunner.query(`ALTER TABLE "partidas_contables" ADD IF NOT EXISTS "tercero_id" integer`);
        await queryRunner.query(`ALTER TABLE "partidas_contables" ADD IF NOT EXISTS "tercero_tipo" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "partidas_contables" ADD IF NOT EXISTS "centro_costo_id" integer`);
        await queryRunner.query(`ALTER TABLE "partidas_contables" ADD IF NOT EXISTS "sri_sustento_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "partidas_contables" DROP COLUMN IF EXISTS "sri_sustento_id"`);
        await queryRunner.query(`ALTER TABLE "partidas_contables" DROP COLUMN IF EXISTS "centro_costo_id"`);
        await queryRunner.query(`ALTER TABLE "partidas_contables" DROP COLUMN IF EXISTS "tercero_tipo"`);
        await queryRunner.query(`ALTER TABLE "partidas_contables" DROP COLUMN IF EXISTS "tercero_id"`);

        await queryRunner.query(`ALTER TABLE "cuentas_contables" DROP COLUMN IF EXISTS "requiere_centro_costo"`);
        await queryRunner.query(`ALTER TABLE "cuentas_contables" DROP COLUMN IF EXISTS "requiere_auxiliar"`);
        await queryRunner.query(`ALTER TABLE "cuentas_contables" DROP COLUMN IF EXISTS "sri_codigo"`);
        await queryRunner.query(`ALTER TABLE "cuentas_contables" DROP COLUMN IF EXISTS "naturaleza"`);

        await queryRunner.query(`DROP TYPE IF EXISTS "public"."cuentas_contables_naturaleza_enum"`);
    }

}
