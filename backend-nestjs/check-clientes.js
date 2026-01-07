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

        // Buscar cliente con RUC similar al que aparece en la imagen
        const ruc = '1718273038';
        const res = await client.query('SELECT * FROM clientes WHERE ruc = $1 OR ruc LIKE $2', [ruc, ruc + '%']);

        console.log('\n=== CLIENTES CON RUC ' + ruc + ' ===');
        console.log('Total encontrados:', res.rows.length);

        if (res.rows.length > 0) {
            console.log('Clientes:');
            res.rows.forEach((c, i) => {
                console.log(`  ${i + 1}. ID=${c.id}, RUC=${c.ruc}, Nombre=${c.nombre}`);
            });
        } else {
            console.log('No se encontraron clientes con ese RUC');
        }

        // Ver todos los clientes
        const all = await client.query('SELECT id, ruc, nombre FROM clientes LIMIT 10');
        console.log('\n=== TODOS LOS CLIENTES (max 10) ===');
        all.rows.forEach(c => console.log(`  ID=${c.id}, RUC=${c.ruc}, Nombre=${c.nombre}`));

        return client.end();
    })
    .catch(err => {
        console.error('Error:', err.message);
        process.exit(1);
    });
