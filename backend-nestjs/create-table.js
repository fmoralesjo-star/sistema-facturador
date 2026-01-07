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

const createTableQuery = `
CREATE TABLE IF NOT EXISTS "caja_chica_movimientos" (
  "id" SERIAL NOT NULL,
  "punto_venta_id" integer NOT NULL,
  "tipo" character varying NOT NULL,
  "monto" numeric(10,2) NOT NULL,
  "descripcion" character varying NOT NULL,
  "referencia" character varying,
  "fecha" TIMESTAMP NOT NULL DEFAULT now(),
  "usuario_id" integer NOT NULL,
  "saldo_resultante" numeric(10,2) NOT NULL,
  CONSTRAINT "PK_caja_chica_movimientos" PRIMARY KEY ("id")
);
`;

client.connect()
    .then(async () => {
        console.log('🔌 Connected. Creating table...');
        await client.query(createTableQuery);
        console.log('✅ TABLE "caja_chica_movimientos" CREATED!');
        return client.end();
    })
    .catch(err => {
        console.error('❌ FAILED to create table:', err.message);
        process.exit(1);
    });
