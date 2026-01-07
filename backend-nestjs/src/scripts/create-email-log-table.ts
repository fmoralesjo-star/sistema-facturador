
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function createEmailLogTable() {
    const client = new Client({
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
    });

    try {
        await client.connect();
        console.log('Conectado a la base de datos...');

        const query = `
            CREATE TABLE IF NOT EXISTS email_logs (
                id SERIAL PRIMARY KEY,
                destinatario VARCHAR NOT NULL,
                asunto VARCHAR NOT NULL,
                error_detalle TEXT,
                estado VARCHAR DEFAULT 'PENDIENTE',
                fecha_creacion TIMESTAMP DEFAULT NOW(),
                fecha_envio TIMESTAMP
            );
        `;

        await client.query(query);
        console.log('✅ Tabla email_logs verificada/creada exitosamente.');

    } catch (error) {
        console.error('❌ Error creando tabla:', error);
    } finally {
        await client.end();
    }
}

createEmailLogTable();
