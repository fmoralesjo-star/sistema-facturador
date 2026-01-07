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
        console.log('Conectado a la base de datos');

        // Verificar si existe la tabla puntos_venta
        const tablaRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'puntos_venta'");
        console.log('\n=== TABLA PUNTOS_VENTA ===');
        if (tablaRes.rows.length > 0) {
            console.log('✅ La tabla puntos_venta EXISTE');

            // Ver columnas
            const colsRes = await client.query(`
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'puntos_venta'
                ORDER BY ordinal_position
            `);
            console.log('\nColumnas:');
            colsRes.rows.forEach(col => {
                console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
            });

            // Ver datos
            const dataRes = await client.query('SELECT * FROM puntos_venta LIMIT 5');
            console.log('\nDatos (primeros 5):');
            console.log(dataRes.rows);
        } else {
            console.log('❌ La tabla puntos_venta NO EXISTE');
        }

        return client.end();
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
