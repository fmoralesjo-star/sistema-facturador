
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    user: process.env.DATABASE_USER || 'facturador',
    host: process.env.DATABASE_HOST || 'localhost',
    database: process.env.DATABASE_NAME || 'facturador_db',
    password: process.env.DATABASE_PASSWORD || 'password',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
});

client.connect()
    .then(async () => {
        console.log('Connected to DB');
        const res = await client.query("UPDATE usuarios SET rol_id = 1 WHERE email = 'admin_real@test.com'");
        console.log(`Updated ${res.rowCount} rows`);
        await client.end();
    })
    .catch(err => {
        console.error('Error', err);
        client.end();
    });
