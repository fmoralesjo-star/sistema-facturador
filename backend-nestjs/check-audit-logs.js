
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.DATABASE_USER || 'postgres',
    host: 'localhost',
    database: process.env.DATABASE_NAME || 'facturador_db',
    password: process.env.DATABASE_PASSWORD || 'password',
    port: 5432,
});

async function checkLogs() {
    try {
        await client.connect();
        console.log('Connected to database');
        const res = await client.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5');
        console.log('Last 5 audit logs:');
        console.table(res.rows);
    } catch (err) {
        console.error('Error querying logs:', err);
    } finally {
        await client.end();
    }
}

checkLogs();
