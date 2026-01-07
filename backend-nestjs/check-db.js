
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 5432,
    user: process.env.DATABASE_USER || 'facturador',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'facturador_db',
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

console.log('Testing connection with:');
console.log(`Host: ${client.host}`);
console.log(`Port: ${client.port}`);
console.log(`User: ${client.user}`);
console.log(`Database: ${client.database}`);

client.connect()
    .then(() => {
        console.log('✅ Connection successful!');
        return client.end();
    })
    .catch(err => {
        console.error('❌ Connection failed:', err.message);
        if (err.code) console.error('Error code:', err.code);
        process.exit(1);
    });
