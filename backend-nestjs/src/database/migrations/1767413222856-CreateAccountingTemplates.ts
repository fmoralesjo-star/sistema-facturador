import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAccountingTemplates1767413222856 implements MigrationInterface {
    name = 'CreateAccountingTemplates1767413222856'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enforce Type existence first to avoid errors if re-running partially
        const checkType = await queryRunner.query(`SELECT 1 FROM pg_type WHERE typname = 'plantillas_asientos_origen_enum'`);
        if (checkType.length === 0) {
            await queryRunner.query(`CREATE TYPE "public"."plantillas_asientos_origen_enum" AS ENUM('VENTAS', 'COMPRAS', 'TESORERIA', 'INVENTARIO', 'NOMINA')`);
        }

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "plantillas_asientos" ("id" SERIAL NOT NULL, "codigo" character varying(50) NOT NULL, "nombre" character varying(100) NOT NULL, "origen" "public"."plantillas_asientos_origen_enum" NOT NULL, "descripcion" text, "activo" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7db0cd6ba8c218ead5517eb73c4" UNIQUE ("codigo"), CONSTRAINT "PK_3e23223e2463b2f0684f76f84b1" PRIMARY KEY ("id"))`);

        const checkTypeMov = await queryRunner.query(`SELECT 1 FROM pg_type WHERE typname = 'plantilla_detalles_tipo_movimiento_enum'`);
        if (checkTypeMov.length === 0) {
            await queryRunner.query(`CREATE TYPE "public"."plantilla_detalles_tipo_movimiento_enum" AS ENUM('DEBE', 'HABER')`);
        }

        const checkTypeVal = await queryRunner.query(`SELECT 1 FROM pg_type WHERE typname = 'plantilla_detalles_tipo_valor_enum'`);
        if (checkTypeVal.length === 0) {
            await queryRunner.query(`CREATE TYPE "public"."plantilla_detalles_tipo_valor_enum" AS ENUM('TOTAL', 'SUBTOTAL_15', 'SUBTOTAL_0', 'IVA', 'DESCUENTO', 'ICE', 'PROPINA', 'VALOR_FIJO')`);
        }

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "plantilla_detalles" ("id" SERIAL NOT NULL, "plantilla_id" integer NOT NULL, "cuenta_codigo" character varying(50) NOT NULL, "tipo_movimiento" "public"."plantilla_detalles_tipo_movimiento_enum" NOT NULL, "tipo_valor" "public"."plantilla_detalles_tipo_valor_enum" NOT NULL, "porcentaje" numeric(5,2) NOT NULL DEFAULT '100', "orden" integer NOT NULL DEFAULT '0', "referencia_opcional" text, CONSTRAINT "PK_ca2926547266f70b155577de1c8" PRIMARY KEY ("id"))`);

        // Check if constraint exists before adding
        const constraintExists = await queryRunner.query(`SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_107b23a2d1c81fb4f9c7e8176f3'`);
        if (constraintExists.length === 0) {
            await queryRunner.query(`ALTER TABLE "plantilla_detalles" ADD CONSTRAINT "FK_107b23a2d1c81fb4f9c7e8176f3" FOREIGN KEY ("plantilla_id") REFERENCES "plantillas_asientos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plantilla_detalles" DROP CONSTRAINT IF EXISTS "FK_107b23a2d1c81fb4f9c7e8176f3"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "plantilla_detalles"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."plantilla_detalles_tipo_valor_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."plantilla_detalles_tipo_movimiento_enum"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "plantillas_asientos"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."plantillas_asientos_origen_enum"`);
    }

}
