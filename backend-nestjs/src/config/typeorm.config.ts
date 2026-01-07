import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config(); // Load .env file

export default new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USER || 'facturador',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'facturador_db',
    entities: [join(__dirname, '..', 'modules', '**', 'entities', '*.entity.{ts,js}')],
    migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
    synchronize: false,
    logging: true,
});
