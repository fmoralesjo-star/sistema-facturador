import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedAccountingTemplates1767413553707 implements MigrationInterface {
    name = 'SeedAccountingTemplates1767413553707'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Insertar Cabecera
        await queryRunner.query(`
            INSERT INTO plantillas_asientos (codigo, nombre, origen, descripcion, activo) 
            VALUES ('VENTA_FACTURA', 'Venta con Factura (Partida Doble)', 'VENTAS', 'Genera CxC, Ventas e IVA', true)
            ON CONFLICT (codigo) DO NOTHING
        `);

        // 2. Insertar Detalles
        // Detalle 1: Cuentas por Cobrar (DEBE por el TOTAL)
        await queryRunner.query(`
            INSERT INTO plantilla_detalles (plantilla_id, cuenta_codigo, tipo_movimiento, tipo_valor, porcentaje, orden) 
            VALUES 
            ((SELECT id FROM plantillas_asientos WHERE codigo = 'VENTA_FACTURA'), '@CLIENTE_CXC', 'DEBE', 'TOTAL', 100, 1)
        `);

        // Detalle 2: Ingreso Ventas (HABER por el SUBTOTAL)
        await queryRunner.query(`
            INSERT INTO plantilla_detalles (plantilla_id, cuenta_codigo, tipo_movimiento, tipo_valor, porcentaje, orden) 
            VALUES 
            ((SELECT id FROM plantillas_asientos WHERE codigo = 'VENTA_FACTURA'), '4.1.01', 'HABER', 'SUBTOTAL_15', 100, 2)
        `);

        // Detalle 3: IVA por Pagar (HABER por el IVA)
        await queryRunner.query(`
            INSERT INTO plantilla_detalles (plantilla_id, cuenta_codigo, tipo_movimiento, tipo_valor, porcentaje, orden) 
            VALUES 
            ((SELECT id FROM plantillas_asientos WHERE codigo = 'VENTA_FACTURA'), '2.1.02.01', 'HABER', 'IVA', 100, 3)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Borrar primero detalles, luego cabecera (cascade debería encargarse, pero por si acaso)
        await queryRunner.query(`DELETE FROM plantilla_detalles WHERE plantilla_id IN (SELECT id FROM plantillas_asientos WHERE codigo = 'VENTA_FACTURA')`);
        await queryRunner.query(`DELETE FROM plantillas_asientos WHERE codigo = 'VENTA_FACTURA'`);
    }

}
