"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBankExtractsTable1767414316216 = void 0;
class CreateBankExtractsTable1767414316216 {
    constructor() {
        this.name = 'CreateBankExtractsTable1767414316216';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "movimientos_bancarios_extracto" ("id" SERIAL NOT NULL, "banco_id" integer NOT NULL, "fecha" date NOT NULL, "descripcion" text NOT NULL, "referencia" character varying(100), "monto" numeric(15,2) NOT NULL, "conciliado" boolean NOT NULL DEFAULT false, "conciliacion_bancaria_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_movimientos_bancarios_extracto" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "movimientos_bancarios_extracto" ADD CONSTRAINT "FK_movimientos_bancarios_extracto_banco" FOREIGN KEY ("banco_id") REFERENCES "bancos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "movimientos_bancarios_extracto" DROP CONSTRAINT "FK_movimientos_bancarios_extracto_banco"`);
        await queryRunner.query(`DROP TABLE "movimientos_bancarios_extracto"`);
    }
}
exports.CreateBankExtractsTable1767414316216 = CreateBankExtractsTable1767414316216;
//# sourceMappingURL=1767414316216-CreateBankExtractsTable.js.map