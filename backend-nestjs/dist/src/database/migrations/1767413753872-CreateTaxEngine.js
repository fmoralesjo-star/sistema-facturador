"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTaxEngine1767413753872 = void 0;
class CreateTaxEngine1767413753872 {
    constructor() {
        this.name = 'CreateTaxEngine1767413753872';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."sri_retenciones_tipo_enum" AS ENUM('RENTA', 'IVA', 'ISD')`);
        await queryRunner.query(`CREATE TABLE "sri_retenciones" ("id" SERIAL NOT NULL, "codigo" character varying(10) NOT NULL, "descripcion" character varying(300) NOT NULL, "porcentaje" numeric(5,2) NOT NULL, "tipo" "public"."sri_retenciones_tipo_enum" NOT NULL DEFAULT 'RENTA', "fecha_vigencia_inicio" date, "fecha_vigencia_fin" date, "activo" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_sri_retenciones_codigo" UNIQUE ("codigo"), CONSTRAINT "PK_sri_retenciones" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "proveedores" ADD "tipo_contribuyente" character varying(50) DEFAULT 'OTROS'`);
        await queryRunner.query(`ALTER TABLE "proveedores" ADD "obligado_contabilidad" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "proveedores" ADD "es_parte_relacionada" boolean NOT NULL DEFAULT false`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "proveedores" DROP COLUMN "es_parte_relacionada"`);
        await queryRunner.query(`ALTER TABLE "proveedores" DROP COLUMN "obligado_contabilidad"`);
        await queryRunner.query(`ALTER TABLE "proveedores" DROP COLUMN "tipo_contribuyente"`);
        await queryRunner.query(`DROP TABLE "sri_retenciones"`);
        await queryRunner.query(`DROP TYPE "public"."sri_retenciones_tipo_enum"`);
    }
}
exports.CreateTaxEngine1767413753872 = CreateTaxEngine1767413753872;
//# sourceMappingURL=1767413753872-CreateTaxEngine.js.map