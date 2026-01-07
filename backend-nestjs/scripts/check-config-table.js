
const { DataSource } = require('typeorm');
const dotenv = require('dotenv');
const { Configuracion } = require('../dist/modules/admin/entities/configuracion.entity');
// Note: We might need to point to src if dist is not updated, but we ran start:dev so dist should be updating or we use ts-node.
// Let's us plain JS and SQL for robustness to avoid import issues.

dotenv.config();

const { Client } = require('pg');

const client = new Client({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});

async function checkConfig() {
    try {
        await client.connect();
        console.log('Connected to DB');

        // Check if table exists
        const resTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE  table_schema = 'public'
        AND    table_name   = 'configuraciones'
      );
    `);

        const exists = resTable.rows[0].exists;
        console.log('Table "configuraciones" exists:', exists);

        if (!exists) {
            console.log('Table does not exist! Entity sync failed?');
            // We could create it manually here if desperate, but better to know why.
            return;
        }

        // Check count
        const resCount = await client.query('SELECT count(*) FROM configuraciones');
        const count = parseInt(resCount.rows[0].count, 10);
        console.log('Row count:', count);

        if (count === 0) {
            console.log('Table is empty. Seeding defaults...');
            const defaults = [
                // EMISION
                { clave: 'sri_regimen_rimpe', valor: 'false', descripcion: 'Contribuyente Régimen RIMPE', tipo: 'boolean', grupo: 'EMISION' },
                { clave: 'sri_agente_retencion', valor: '', descripcion: 'Resolución Agente de Retención', tipo: 'string', grupo: 'EMISION' },
                { clave: 'sri_contribuyente_especial', valor: '', descripcion: 'Resolución Contribuyente Especial', tipo: 'string', grupo: 'EMISION' },
                { clave: 'sri_ambiente', valor: 'pruebas', descripcion: 'Ambiente (pruebas/produccion)', tipo: 'string', grupo: 'EMISION' },
                { clave: 'sri_tipo_emision', valor: '1', descripcion: 'Tipo Emisión (1: Normal)', tipo: 'string', grupo: 'EMISION' },
                { clave: 'impuesto_iva_codigo', valor: '2', descripcion: 'Código Impuesto IVA', tipo: 'string', grupo: 'EMISION' },
                { clave: 'impuesto_iva_porcentaje', valor: '15', descripcion: 'Porcentaje IVA Actual', tipo: 'number', grupo: 'EMISION' },
                { clave: 'sri_timeout', valor: '20', descripcion: 'Timeout SRI (segundos)', tipo: 'number', grupo: 'EMISION' },

                // RIDE
                { clave: 'ride_logo_path', valor: '', descripcion: 'Ruta del Logotipo', tipo: 'string', grupo: 'RIDE' },
                { clave: 'ride_info_adicional', valor: 'Gracias por su compra', descripcion: 'Texto adicional fijo', tipo: 'string', grupo: 'RIDE' },
                { clave: 'ride_color_primario', valor: '#3366cc', descripcion: 'Color Primario PDF', tipo: 'string', grupo: 'RIDE' },
                { clave: 'cliente_email_obligatorio', valor: 'false', descripcion: 'Email Cliente Obligatorio', tipo: 'boolean', grupo: 'RIDE' },
                { clave: 'cliente_direccion_obligatoria', valor: 'false', descripcion: 'Dirección Cliente Obligatoria', tipo: 'boolean', grupo: 'RIDE' },

                // PUNTOS (Datos generales sobre puntos)
                { clave: 'secuencial_reset_password', valor: 'admin123', descripcion: 'Contraseña para resetear secuenciales', tipo: 'string', grupo: 'PUNTOS' },

                // GENERAL DE LA EMPRESA (Retrocompatibilidad)
                { clave: 'nombre_empresa', valor: 'Mi Empresa', descripcion: 'Nombre de la empresa', tipo: 'string', grupo: 'GENERAL' },
                { clave: 'ruc_empresa', valor: '', descripcion: 'RUC de la empresa', tipo: 'string', grupo: 'GENERAL' },
                { clave: 'direccion_empresa', valor: '', descripcion: 'Dirección de la empresa', tipo: 'string', grupo: 'GENERAL' },
                { clave: 'telefono_empresa', valor: '', descripcion: 'Teléfono de la empresa', tipo: 'string', grupo: 'GENERAL' },
                { clave: 'email_empresa', valor: '', descripcion: 'Email de la empresa', tipo: 'string', grupo: 'GENERAL' },
            ];

            for (const d of defaults) {
                await client.query(
                    `INSERT INTO configuraciones (clave, valor, descripcion, tipo, grupo) VALUES ($1, $2, $3, $4, $5)`,
                    [d.clave, d.valor, d.descripcion, d.tipo, d.grupo]
                );
            }
            console.log('Seeding complete.');
        } else {
            const rows = await client.query('SELECT * FROM configuraciones');
            console.log('Current Data:', rows.rows);
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await client.end();
    }
}

checkConfig();
