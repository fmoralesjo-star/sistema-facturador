"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedAccountingTemplates1767413553707 = void 0;
class SeedAccountingTemplates1767413553707 {
    constructor() {
        this.name = 'SeedAccountingTemplates1767413553707';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            INSERT INTO plantillas_asientos (codigo, nombre, origen, descripcion, activo) 
            VALUES ('VENTA_FACTURA', 'Venta con Factura (Partida Doble)', 'VENTAS', 'Genera CxC, Ventas e IVA', true)
            ON CONFLICT (codigo) DO NOTHING
        `);
        await queryRunner.query(`
            INSERT INTO plantilla_detalles (plantilla_id, cuenta_codigo, tipo_movimiento, tipo_valor, porcentaje, orden) 
            VALUES 
            ((SELECT id FROM plantillas_asientos WHERE codigo = 'VENTA_FACTURA'), '@CLIENTE_CXC', 'DEBE', 'TOTAL', 100, 1)
        `);
        await queryRunner.query(`
            INSERT INTO plantilla_detalles (plantilla_id, cuenta_codigo, tipo_movimiento, tipo_valor, porcentaje, orden) 
            VALUES 
            ((SELECT id FROM plantillas_asientos WHERE codigo = 'VENTA_FACTURA'), '4.1.01', 'HABER', 'SUBTOTAL_15', 100, 2)
        `);
        await queryRunner.query(`
            INSERT INTO plantilla_detalles (plantilla_id, cuenta_codigo, tipo_movimiento, tipo_valor, porcentaje, orden) 
            VALUES 
            ((SELECT id FROM plantillas_asientos WHERE codigo = 'VENTA_FACTURA'), '2.1.02.01', 'HABER', 'IVA', 100, 3)
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DELETE FROM plantilla_detalles WHERE plantilla_id IN (SELECT id FROM plantillas_asientos WHERE codigo = 'VENTA_FACTURA')`);
        await queryRunner.query(`DELETE FROM plantillas_asientos WHERE codigo = 'VENTA_FACTURA'`);
    }
}
exports.SeedAccountingTemplates1767413553707 = SeedAccountingTemplates1767413553707;
//# sourceMappingURL=1767413553707-SeedAccountingTemplates.js.map