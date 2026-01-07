const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function fixPuntosVenta() {
    const client = new Client({
        user: process.env.DATABASE_USER || 'facturador',
        host: 'localhost',
        database: process.env.DATABASE_NAME || 'facturador_db',
        password: process.env.DATABASE_PASSWORD || 'password',
        port: 5432,
    });

    try {
        await client.connect();
        console.log('✅ Conectado a la base de datos');

        const query = `
      UPDATE puntos_venta 
      SET nombre = 'Punto de Venta ' || id 
      WHERE nombre IS NULL OR nombre = '';
    `;

        const res = await client.query(query);
        console.log(`✅ Se actualizaron ${res.rowCount} registros en puntos_venta`);

    } catch (err) {
        console.error('❌ Error ejecutando la corrección:', err.stack);
    } finally {
        await client.end();
    }
}

fixPuntosVenta();
