const { Client } = require('pg');
require('dotenv').config();

async function checkSchema() {
    const client = new Client({
        host: process.env.DATABASE_HOST || 'localhost',
        port: process.env.DATABASE_PORT || 5432,
        user: process.env.DATABASE_USER || 'facturador',
        password: process.env.DATABASE_PASSWORD || 'password',
        database: process.env.DATABASE_NAME || 'facturador_db',
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name, data_type, character_maximum_length, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'puntos_venta'
        `);
        console.log('Esquema de puntos_venta:', res.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkSchema();
