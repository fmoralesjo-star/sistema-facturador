const { Client } = require('pg');
require('dotenv').config();

async function updateDatabase() {
    const client = new Client({
        host: process.env.DATABASE_HOST || 'localhost',
        port: process.env.DATABASE_PORT || 5432,
        user: process.env.DATABASE_USER || 'facturador',
        password: process.env.DATABASE_PASSWORD || 'password',
        database: process.env.DATABASE_NAME || 'facturador_db',
    });

    try {
        await client.connect();

        console.log('Agregando columnas faltantes a puntos_venta...');

        // Agregar 'tipo' y 'es_principal' que faltaban en la DB según mi investigación previa
        // El esquema mostrado en check-schema.js NO mostraba tipo ni es_principal
        await client.query(`
            ALTER TABLE puntos_venta 
            ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'TIENDA',
            ADD COLUMN IF NOT EXISTS es_principal BOOLEAN DEFAULT false;
        `);

        // Cambiar direccion a TEXT si es necesario (ya era text según check-schema)

        console.log('✅ Base de datos actualizada correctamente');
    } catch (err) {
        console.error('❌ Error al actualizar la base de datos:', err);
    } finally {
        await client.end();
    }
}

updateDatabase();
