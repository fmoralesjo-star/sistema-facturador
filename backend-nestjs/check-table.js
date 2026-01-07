require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: process.env.DATABASE_USER || 'facturador',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'facturador_db',
    connectionTimeoutMillis: 5000,
});

client.connect()
    .then(async () => {
        console.log('Using User:', client.user);
        const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'caja_chica_movimiento'");
        console.log('Tables found:', res.rows);
        if (res.rows.length > 0) {
            console.log('✅ TABLE EXISTS');
        } else {
            console.log('❌ TABLE MISSING');
        }
        return client.end();
    })
    .catch(err => {
        console.error('❌ Connection FAILED:', err.message);
        process.exit(1);
    });
