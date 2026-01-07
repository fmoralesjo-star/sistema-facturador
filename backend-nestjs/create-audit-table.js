
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.DATABASE_USER || 'postgres',
    host: 'localhost',
    database: process.env.DATABASE_NAME || 'facturador_db',
    password: process.env.DATABASE_PASSWORD || 'password',
    port: 5432,
});

const createTableQuery = `
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER,
    usuario_nombre VARCHAR(100),
    accion VARCHAR(100) NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    entidad_id VARCHAR(50),
    valor_anterior TEXT,
    valor_nuevo TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);
`;

async function createTable() {
    try {
        await client.connect();
        console.log('Connected to database');
        await client.query(createTableQuery);
        console.log('Table audit_logs created successfully');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        await client.end();
    }
}

createTable();
