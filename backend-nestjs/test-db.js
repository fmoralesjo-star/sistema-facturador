require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    user: process.env.DATABASE_USER || 'facturador',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'facturador_db',
    connectionTimeoutMillis: 5000,
});

console.log('Testing connection with:', {
    host: client.host,
    port: client.port,
    user: client.user,
    database: client.database,
    password: client.password ? '******' : '(none)'
});

client.connect()
    .then(() => {
        console.log('✅ Connection SUCCESS!');
        return client.end();
    })
    .catch(err => {
        console.error('❌ Connection FAILED:', err.message);
        if (err.code) console.error('Error Code:', err.code);
        process.exit(1);
    });
