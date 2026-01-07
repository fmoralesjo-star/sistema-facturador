"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAccountingSchema1767412893717 = void 0;
class UpdateAccountingSchema1767412893717 {
    constructor() {
        this.name = 'UpdateAccountingSchema1767412893717';
    }
    async up(queryRunner) {
        const checkType = await queryRunner.query(`SELECT 1 FROM pg_type WHERE typname = 'cuentas_contables_naturaleza_enum'`);
        if (checkType.length === 0) {
            await queryRunner.query(`CREATE TYPE "public"."cuentas_contables_naturaleza_enum" AS ENUM('DEUDORA', 'ACREEDORA')`);
        }
        await queryRunner.query(`ALTER TABLE "cuentas_contables" ADD IF NOT EXISTS "naturaleza" "public"."cuentas_contables_naturaleza_enum" NOT NULL DEFAULT 'DEUDORA'`);
        await queryRunner.query(`ALTER TABLE "cuentas_contables" ADD IF NOT EXISTS "sri_codigo" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "cuentas_contables" ADD IF NOT EXISTS "requiere_auxiliar" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "cuentas_contables" ADD IF NOT EXISTS "requiere_centro_costo" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "partidas_contables" ADD IF NOT EXISTS "tercero_id" integer`);
        await queryRunner.query(`ALTER TABLE "partidas_contables" ADD IF NOT EXISTS "tercero_tipo" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "partidas_contables" ADD IF NOT EXISTS "centro_costo_id" integer`);
        await queryRunner.query(`ALTER TABLE "partidas_contables" ADD IF NOT EXISTS "sri_sustento_id" character varying`);
    }
    async down(queryRunner) {
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
exports.UpdateAccountingSchema1767412893717 = UpdateAccountingSchema1767412893717;
//# sourceMappingURL=1767412893717-UpdateAccountingSchema.js.map