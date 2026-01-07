
const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    user: process.env.DATABASE_USER || 'facturador',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'facturador_db',
});

async function createTable() {
    try {
        await client.connect();
        console.log('Connected to DB');

        // Definition matches Update in configuracion.entity.ts
        // clave: string (PrimaryColumn)
        // valor: text, nullable
        // descripcion: string, nullable
        // tipo: string, default 'string'
        // grupo: string, default 'GENERAL'

        const query = `
      CREATE TABLE IF NOT EXISTS configuraciones (
        clave VARCHAR(255) PRIMARY KEY,
        valor TEXT,
        descripcion VARCHAR(255),
        tipo VARCHAR(50) DEFAULT 'string',
        grupo VARCHAR(50) DEFAULT 'GENERAL'
      );
    `;

        await client.query(query);
        console.log('Table "configuraciones" created or already exists.');

    } catch (e) {
        console.error('Error creating table:', e);
    } finally {
        await client.end();
    }
}

createTable();
