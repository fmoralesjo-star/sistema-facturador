"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const path = require("path");
(0, dotenv_1.config)({ path: path.resolve(__dirname, '../../.env') });
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: process.env.DATABASE_USER || 'facturador',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'facturador_db',
    synchronize: false,
    logging: true,
});
async function runMigration() {
    try {
        console.log('Iniciando conexión para migración manual...');
        await AppDataSource.initialize();
        console.log('Conexión exitosa. Ejecutando ALTER TABLE...');
        const queryRunner = AppDataSource.createQueryRunner();
        const table = await queryRunner.getTable('puntos_venta');
        if (!table) {
            console.error('Error: La tabla puntos_venta no existe.');
            process.exit(1);
        }
        const hasSecuenciaFactura = table.columns.find(c => c.name === 'secuencia_factura');
        if (!hasSecuenciaFactura) {
            console.log('Agregando columna secuencia_factura...');
            await queryRunner.query(`ALTER TABLE "puntos_venta" ADD "secuencia_factura" integer NOT NULL DEFAULT '1'`);
        }
        else {
            console.log('La columna secuencia_factura ya existe.');
        }
        const hasSecuenciaNotaCredito = table.columns.find(c => c.name === 'secuencia_nota_credito');
        if (!hasSecuenciaNotaCredito) {
            console.log('Agregando columna secuencia_nota_credito...');
            await queryRunner.query(`ALTER TABLE "puntos_venta" ADD "secuencia_nota_credito" integer NOT NULL DEFAULT '1'`);
        }
        else {
            console.log('La columna secuencia_nota_credito ya existe.');
        }
        console.log('Migración completada exitosamente.');
        await AppDataSource.destroy();
    }
    catch (error) {
        console.error('Error durante la migración:', error);
        process.exit(1);
    }
}
runMigration();
//# sourceMappingURL=manual-migration.js.map