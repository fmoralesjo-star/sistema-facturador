import { DataSource } from 'typeorm';

async function runMigration() {
    const dataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'Dare12345?',
        database: 'facturador_db',
        synchronize: false,
    });

    await dataSource.initialize();
    console.log('Conexión establecida');

    try {
        // Agregar columnas nuevas a caja_chica_movimientos
        await dataSource.query(`
            ALTER TABLE caja_chica_movimientos 
            ADD COLUMN IF NOT EXISTS categoria VARCHAR(50) DEFAULT 'VARIOS'
        `);
        console.log('✅ Columna categoria agregada');

        await dataSource.query(`
            ALTER TABLE caja_chica_movimientos 
            ADD COLUMN IF NOT EXISTS es_deducible BOOLEAN DEFAULT true
        `);
        console.log('✅ Columna es_deducible agregada');

        await dataSource.query(`
            ALTER TABLE caja_chica_movimientos 
            ADD COLUMN IF NOT EXISTS numero_documento VARCHAR(100)
        `);
        console.log('✅ Columna numero_documento agregada');

        await dataSource.query(`
            ALTER TABLE caja_chica_movimientos 
            ADD COLUMN IF NOT EXISTS proveedor_nombre VARCHAR(200)
        `);
        console.log('✅ Columna proveedor_nombre agregada');

        // Crear tabla comprobantes_retencion
        await dataSource.query(`
            CREATE TABLE IF NOT EXISTS comprobantes_retencion (
                id SERIAL PRIMARY KEY,
                compra_id INTEGER NOT NULL REFERENCES compras(id),
                clave_acceso VARCHAR(49) UNIQUE NOT NULL,
                establecimiento VARCHAR(3) NOT NULL,
                punto_emision VARCHAR(3) NOT NULL,
                secuencial VARCHAR(9) NOT NULL,
                fecha_emision DATE NOT NULL,
                proveedor_id INTEGER REFERENCES proveedores(id),
                ruc_proveedor VARCHAR(13) NOT NULL,
                razon_social_proveedor VARCHAR(300) NOT NULL,
                codigo_sustento VARCHAR(2) DEFAULT '01',
                tipo_doc_sustento VARCHAR(2) DEFAULT '01',
                numero_doc_sustento VARCHAR(17) NOT NULL,
                fecha_doc_sustento DATE NOT NULL,
                retencion_renta_codigo VARCHAR(10),
                retencion_renta_porcentaje DECIMAL(5,2) DEFAULT 0,
                retencion_renta_base DECIMAL(12,2) DEFAULT 0,
                retencion_renta_valor DECIMAL(12,2) DEFAULT 0,
                retencion_iva_codigo VARCHAR(10),
                retencion_iva_porcentaje DECIMAL(5,2) DEFAULT 0,
                retencion_iva_base DECIMAL(12,2) DEFAULT 0,
                retencion_iva_valor DECIMAL(12,2) DEFAULT 0,
                total_retenido DECIMAL(12,2) DEFAULT 0,
                estado VARCHAR(20) DEFAULT 'GENERADO',
                numero_autorizacion VARCHAR(49),
                fecha_autorizacion TIMESTAMP,
                xml_generado TEXT,
                xml_firmado TEXT,
                xml_autorizado TEXT,
                pdf_path VARCHAR(500),
                mensajes_sri JSONB,
                error_message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla comprobantes_retencion creada');

        // Crear índices
        await dataSource.query(`
            CREATE INDEX IF NOT EXISTS idx_retencion_compra ON comprobantes_retencion(compra_id)
        `);
        await dataSource.query(`
            CREATE INDEX IF NOT EXISTS idx_retencion_estado ON comprobantes_retencion(estado)
        `);
        await dataSource.query(`
            CREATE INDEX IF NOT EXISTS idx_retencion_fecha ON comprobantes_retencion(fecha_emision)
        `);
        console.log('✅ Índices creados');

        console.log('✅ Migración completada exitosamente');
    } catch (error) {
        console.error('Error en migración:', error);
    } finally {
        await dataSource.destroy();
    }
}

runMigration();
