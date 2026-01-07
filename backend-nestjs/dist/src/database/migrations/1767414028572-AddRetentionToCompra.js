"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRetentionToCompra1767414028572 = void 0;
class AddRetentionToCompra1767414028572 {
    constructor() {
        this.name = 'AddRetentionToCompra1767414028572';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "compras" ADD "retencion_renta_codigo" character varying(10)`);
        await queryRunner.query(`ALTER TABLE "compras" ADD "retencion_renta_porcentaje" numeric(5,2) DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "compras" ADD "retencion_renta_valor" numeric(10,2) DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "compras" ADD "retencion_iva_codigo" character varying(10)`);
        await queryRunner.query(`ALTER TABLE "compras" ADD "retencion_iva_porcentaje" numeric(5,2) DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "compras" ADD "retencion_iva_valor" numeric(10,2) DEFAULT '0'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "compras" DROP COLUMN "retencion_iva_valor"`);
        await queryRunner.query(`ALTER TABLE "compras" DROP COLUMN "retencion_iva_porcentaje"`);
        await queryRunner.query(`ALTER TABLE "compras" DROP COLUMN "retencion_iva_codigo"`);
        await queryRunner.query(`ALTER TABLE "compras" DROP COLUMN "retencion_renta_valor"`);
        await queryRunner.query(`ALTER TABLE "compras" DROP COLUMN "retencion_renta_porcentaje"`);
        await queryRunner.query(`ALTER TABLE "compras" DROP COLUMN "retencion_renta_codigo"`);
    }
}
exports.AddRetentionToCompra1767414028572 = AddRetentionToCompra1767414028572;
//# sourceMappingURL=1767414028572-AddRetentionToCompra.js.map