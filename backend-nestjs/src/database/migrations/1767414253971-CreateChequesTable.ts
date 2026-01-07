import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateChequesTable1767414253971 implements MigrationInterface {
    name = 'CreateChequesTable1767414253971'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enums
        await queryRunner.query(`CREATE TYPE "public"."cheques_tipo_enum" AS ENUM('GIRADO', 'RECIBIDO')`);
        await queryRunner.query(`CREATE TYPE "public"."cheques_estado_enum" AS ENUM('EMITIDO', 'ENTREGADO', 'COBRADO', 'ANULADO', 'PROTESTADO', 'DEPOSITADO')`);

        // Table
        await queryRunner.query(`CREATE TABLE "cheques" ("id" SERIAL NOT NULL, "numero" character varying(50) NOT NULL, "monto" numeric(15,2) NOT NULL, "fecha_emision" date NOT NULL, "fecha_pago" date NOT NULL, "beneficiario" character varying(255), "tipo" "public"."cheques_tipo_enum" NOT NULL DEFAULT 'GIRADO', "estado" "public"."cheques_estado_enum" NOT NULL DEFAULT 'EMITIDO', "banco_id" integer, "proveedor_id" integer, "cliente_id" integer, "observaciones" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cheques" PRIMARY KEY ("id"))`);

        // FKs
        await queryRunner.query(`ALTER TABLE "cheques" ADD CONSTRAINT "FK_cheques_banco" FOREIGN KEY ("banco_id") REFERENCES "bancos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cheques" ADD CONSTRAINT "FK_cheques_proveedor" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cheques" ADD CONSTRAINT "FK_cheques_cliente" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cheques" DROP CONSTRAINT "FK_cheques_cliente"`);
        await queryRunner.query(`ALTER TABLE "cheques" DROP CONSTRAINT "FK_cheques_proveedor"`);
        await queryRunner.query(`ALTER TABLE "cheques" DROP CONSTRAINT "FK_cheques_banco"`);
        await queryRunner.query(`DROP TABLE "cheques"`);
        await queryRunner.query(`DROP TYPE "public"."cheques_estado_enum"`);
        await queryRunner.query(`DROP TYPE "public"."cheques_tipo_enum"`);
    }

}
