import { DataSource } from 'typeorm';
import { config } from 'dotenv';
config();

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USER || 'facturador',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'facturador_db',
    entities: [],
    synchronize: false,
    logging: true,
});

async function run() {
    await dataSource.initialize();
    const queryRunner = dataSource.createQueryRunner();

    try {
        console.log('Starting RLS Application...');

        // 1. Functions
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION current_app_tenant() RETURNS integer AS $$
            BEGIN
                RETURN nullif(current_setting('app.current_tenant', true)::text, '')::integer;
            END;
            $$ LANGUAGE plpgsql;
        `);
        console.log('Function current_app_tenant created.');

        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION current_app_superuser() RETURNS boolean AS $$
            BEGIN
                RETURN nullif(current_setting('app.is_superuser', true)::text, '')::boolean;
            END;
            $$ LANGUAGE plpgsql;
        `);
        console.log('Function current_app_superuser created.');

        const tablesToSecure = [
            'productos', 'clientes', 'facturas', 'movimientos_inventario', 'asientos_contables',
            'cuentas_contables', 'empleados', 'proveedores', 'transferencias', 'notas_credito',
            'bancos', 'caja_chica_movimientos', 'puntos_venta', 'usuarios'
        ];

        for (const table of tablesToSecure) {
            const hasTable = await queryRunner.hasTable(table);
            if (!hasTable) {
                console.log(`Skipping missing table: ${table}`);
                continue;
            }

            console.log(`Processing ${table}...`);

            // Add Column
            try {
                await queryRunner.query(`ALTER TABLE "${table}" ADD COLUMN "tenant_id" integer`);
                console.log(`  Added tenant_id to ${table}`);
            } catch (e) {
                if (e.code === '42701') console.log(`  tenant_id already exists in ${table}`);
                else throw e;
            }

            // FK
            try {
                await queryRunner.query(`ALTER TABLE "${table}" ADD CONSTRAINT "FK_${table}_tenant" FOREIGN KEY ("tenant_id") REFERENCES "users_companies"("id")`);
                console.log(`  Added FK to ${table}`);
            } catch (e) {
                // Ignore if exists (42710)
                if (e.code === '42710') console.log(`  FK already exists in ${table}`);
                else throw e;
            }

            // Migrate Data
            // Check if empresa_id exists
            const check = await queryRunner.query(`SELECT column_name FROM information_schema.columns WHERE table_name='${table}' AND column_name='empresa_id'`);
            if (check.length > 0) {
                await queryRunner.query(`UPDATE "${table}" SET "tenant_id" = "empresa_id" WHERE "empresa_id" IS NOT NULL AND "tenant_id" IS NULL`);
                console.log(`  Migrated data from empresa_id in ${table}`);
            }

            // RLS
            await queryRunner.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`);
            await queryRunner.query(`DROP POLICY IF EXISTS "tenant_isolation_policy" ON "${table}"`);
            await queryRunner.query(`
                CREATE POLICY "tenant_isolation_policy" ON "${table}"
                USING (tenant_id = current_app_tenant() OR current_app_superuser() = true OR tenant_id IS NULL)
                WITH CHECK (tenant_id = current_app_tenant() OR current_app_superuser() = true);
             `);
            console.log(`  Enabled RLS on ${table}`);
        }

        console.log('RLS Application Completed Successfully.');

    } catch (err) {
        console.error('Error applying RLS:', err);
    } finally {
        await dataSource.destroy();
    }
}

run();
