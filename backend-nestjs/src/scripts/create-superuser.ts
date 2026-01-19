import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';

config();

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USER || 'facturador',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'facturador_db',
    entities: [], // No need to load entities if doing raw SQL
    synchronize: false,
    logging: true,
});

async function run() {
    await dataSource.initialize();
    const queryRunner = dataSource.createQueryRunner();

    try {
        console.log('Validating Superuser Prerequisites...');

        // 1. Ensure 'superadmin' role exists
        const roles = await queryRunner.query(`SELECT * FROM "roles" WHERE nombre = 'superadmin'`);
        let roleId;
        if (roles.length === 0) {
            console.log("Creating 'superadmin' role...");
            const res = await queryRunner.query(`INSERT INTO "roles" (nombre, descripcion) VALUES ('superadmin', 'Acceso Global a todos los Tenants') RETURNING id`);
            roleId = res[0].id;
        } else {
            roleId = roles[0].id;
            console.log("'superadmin' role already exists.");
        }

        // 2. Ensure 'Super User' exists
        const users = await queryRunner.query(`SELECT * FROM "usuarios" WHERE nombre_usuario = 'superuser'`);
        if (users.length === 0) {
            console.log("Creating 'superuser'...");
            const hashedPassword = await bcrypt.hash('Admin123!', 10);

            // Insert user with NO tenant_id (NULL) or special setup
            // RLS Policy says: OR tenant_id IS NULL for visibility of shared data.
            // But 'superuser' should be able to see everything due to app.is_superuser bypass.

            await queryRunner.query(`
                INSERT INTO "usuarios" 
                (nombre_usuario, password, email, nombre_completo, rol_id, activo, created_at, updated_at) 
                VALUES 
                ('superuser', '${hashedPassword}', 'super@admin.com', 'Super Administrador', ${roleId}, 1, NOW(), NOW())
            `);
            console.log("User 'superuser' created. Password: 'Admin123!'");
        } else {
            console.log("'superuser' already exists.");
            // Ensure role is correct
            await queryRunner.query(`UPDATE "usuarios" SET rol_id = ${roleId} WHERE nombre_usuario = 'superuser'`);
        }

        console.log("Superuser Setup Complete.");

    } catch (err) {
        console.error("Error setting up superuser:", err);
    } finally {
        await dataSource.destroy();
    }
}

run();
