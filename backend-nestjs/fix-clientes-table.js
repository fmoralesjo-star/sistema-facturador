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

        // Verificar columnas de la tabla clientes
        const colsRes = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'clientes'
            ORDER BY ordinal_position
        `);
        console.log('\n=== COLUMNAS DE TABLA CLIENTES ===');
        colsRes.rows.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type})`);
        });

        // Verificar si faltan las nuevas columnas
        const columnasNecesarias = ['notas', 'limite_credito', 'tipo_cliente', 'total_compras_historico', 'cantidad_compras', 'ultima_compra'];
        const columnasExistentes = colsRes.rows.map(r => r.column_name);

        console.log('\n=== COLUMNAS FALTANTES ===');
        const faltantes = columnasNecesarias.filter(c => !columnasExistentes.includes(c));
        if (faltantes.length === 0) {
            console.log('Todas las columnas necesarias existen');
        } else {
            console.log('Faltan:', faltantes.join(', '));

            // Agregar columnas faltantes
            console.log('\n=== AGREGANDO COLUMNAS FALTANTES ===');
            for (const col of faltantes) {
                let sql = '';
                switch (col) {
                    case 'notas':
                        sql = 'ALTER TABLE clientes ADD COLUMN IF NOT EXISTS notas TEXT';
                        break;
                    case 'limite_credito':
                        sql = 'ALTER TABLE clientes ADD COLUMN IF NOT EXISTS limite_credito DECIMAL(10,2) DEFAULT 0';
                        break;
                    case 'tipo_cliente':
                        sql = "ALTER TABLE clientes ADD COLUMN IF NOT EXISTS tipo_cliente VARCHAR(20) DEFAULT 'REGULAR'";
                        break;
                    case 'total_compras_historico':
                        sql = 'ALTER TABLE clientes ADD COLUMN IF NOT EXISTS total_compras_historico DECIMAL(12,2) DEFAULT 0';
                        break;
                    case 'cantidad_compras':
                        sql = 'ALTER TABLE clientes ADD COLUMN IF NOT EXISTS cantidad_compras INTEGER DEFAULT 0';
                        break;
                    case 'ultima_compra':
                        sql = 'ALTER TABLE clientes ADD COLUMN IF NOT EXISTS ultima_compra DATE';
                        break;
                }
                if (sql) {
                    try {
                        await client.query(sql);
                        console.log(`✅ Columna ${col} agregada`);
                    } catch (err) {
                        console.error(`❌ Error agregando ${col}:`, err.message);
                    }
                }
            }
        }

        return client.end();
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
