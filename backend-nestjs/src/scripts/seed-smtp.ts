
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
config({ path: path.resolve(__dirname, '../../.env') });

const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: process.env.DATABASE_USER || 'facturador',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'facturador_db',
    synchronize: false,
    logging: true,
});

async function runSeed() {
    try {
        console.log('Iniciando conexión para Seed SMTP...');
        await AppDataSource.initialize();

        const queryRunner = AppDataSource.createQueryRunner();

        const configs = [
            { clave: 'smtp_host', valor: '', descripcion: 'Servidor SMTP (Ej: smtp.gmail.com)', tipo: 'string', grupo: 'CORREO' },
            { clave: 'smtp_port', valor: '587', descripcion: 'Puerto SMTP (587 o 465)', tipo: 'number', grupo: 'CORREO' },
            { clave: 'smtp_user', valor: '', descripcion: 'Usuario/Email SMTP', tipo: 'string', grupo: 'CORREO' },
            { clave: 'smtp_password', valor: '', descripcion: 'Contraseña SMTP o App Password', tipo: 'string', grupo: 'CORREO' }, // En prod debería ir encriptado o env
            { clave: 'smtp_secure', valor: 'false', descripcion: 'Usar SSL/TLS (true/false)', tipo: 'boolean', grupo: 'CORREO' },
            { clave: 'smtp_from_name', valor: 'Sistema Facturador', descripcion: 'Nombre remitente', tipo: 'string', grupo: 'CORREO' },
        ];

        for (const conf of configs) {
            // Check if exists
            const existing = await queryRunner.query(`SELECT * FROM configuraciones WHERE clave = '${conf.clave}'`);
            if (existing.length === 0) {
                console.log(`Insertando ${conf.clave}...`);
                await queryRunner.query(
                    `INSERT INTO configuraciones (clave, valor, descripcion, tipo, grupo) VALUES ($1, $2, $3, $4, $5)`,
                    [conf.clave, conf.valor, conf.descripcion, conf.tipo, conf.grupo]
                );
            } else {
                console.log(`${conf.clave} ya existe.`);
            }
        }

        console.log('Seed SMTP completado.');
        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error durante seed:', error);
        process.exit(1);
    }
}

runSeed();
