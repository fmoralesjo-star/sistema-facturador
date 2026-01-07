import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedTaxEngine1767413831031 implements MigrationInterface {
    name = 'SeedTaxEngine1767413831031'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Renteciones Fuente (RENTA)
        await queryRunner.query(`
            INSERT INTO sri_retenciones (codigo, descripcion, porcentaje, tipo) VALUES 
            ('312', 'Transferencia de bienes muebles de naturaleza corporal', 1.75, 'RENTA'),
            ('312A', 'Compra de bienes o servicios de construcción', 1.75, 'RENTA'),
            ('3440', 'Otras compras de bienes y servicios no sujetas a retención', 2.75, 'RENTA'),
            ('343', '1% a RIMPE Emprendedor (Bienes y Servicios)', 1.00, 'RENTA'),
            ('332', '0% a RIMPE Negocio Popular (Notas de Venta)', 0.00, 'RENTA'),
            ('303', 'Honorarios profesionales y demás pagos por servicios relacionados con el título profesional', 10.00, 'RENTA'),
            ('304', 'Servicios predomina el intelecto no relacionados con el título profesional', 8.00, 'RENTA'),
            ('311', 'Servicios de transporte privado de pasajeros o transporte público o privado de carga', 1.00, 'RENTA')
            ON CONFLICT (codigo) DO NOTHING;
        `);

        // Retenciones IVA
        await queryRunner.query(`
            INSERT INTO sri_retenciones (codigo, descripcion, porcentaje, tipo) VALUES 
            ('9', 'Retención IVA 30% (Bienes)', 30.00, 'IVA'),
            ('10', 'Retención IVA 70% (Servicios)', 70.00, 'IVA'),
            ('11', 'Retención IVA 100%', 100.00, 'IVA'),
            ('1', 'Retención IVA 10% (Contribuyentes Especiales)', 10.00, 'IVA'),
            ('2', 'Retención IVA 20% (Contribuyentes Especiales)', 20.00, 'IVA'),
            ('0', 'Sin retención de IVA', 0.00, 'IVA')
            ON CONFLICT (codigo) DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM sri_retenciones`);
    }

}
