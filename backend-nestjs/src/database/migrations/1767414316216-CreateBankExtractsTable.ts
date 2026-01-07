import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBankExtractsTable1767414316216 implements MigrationInterface {
    name = 'CreateBankExtractsTable1767414316216'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "movimientos_bancarios_extracto" ("id" SERIAL NOT NULL, "banco_id" integer NOT NULL, "fecha" date NOT NULL, "descripcion" text NOT NULL, "referencia" character varying(100), "monto" numeric(15,2) NOT NULL, "conciliado" boolean NOT NULL DEFAULT false, "conciliacion_bancaria_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_movimientos_bancarios_extracto" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "movimientos_bancarios_extracto" ADD CONSTRAINT "FK_movimientos_bancarios_extracto_banco" FOREIGN KEY ("banco_id") REFERENCES "bancos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movimientos_bancarios_extracto" DROP CONSTRAINT "FK_movimientos_bancarios_extracto_banco"`);
        await queryRunner.query(`DROP TABLE "movimientos_bancarios_extracto"`);
    }

}
