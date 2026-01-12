const { Client } = require('pg');
require('dotenv').config();

async function check() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        console.log('Connected to database');
        const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'puntos_venta'");
        console.log('Columns in puntos_venta:');
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
check();
