
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.DATABASE_USER || 'postgres',
    host: 'localhost',
    database: process.env.DATABASE_NAME || 'facturador_db',
    password: process.env.DATABASE_PASSWORD || 'password',
    port: 5432,
});

async function insertLog() {
    try {
        await client.connect();
        console.log('Connected to database');
        const query = `
      INSERT INTO audit_logs (accion, modulo, usuario_nombre, ip_address, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;
        const values = ['TEST_ACTION', 'TEST_MODULE', 'Test Script', '127.0.0.1'];
        const res = await client.query(query, values);
        console.log('Inserted log:', res.rows[0]);
    } catch (err) {
        console.error('Error inserting log:', err);
    } finally {
        await client.end();
    }
}

insertLog();
