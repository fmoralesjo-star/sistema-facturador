// Script manual para insertar roles
// Ejecutar con: npx ts-node src/modules/usuarios/scripts/insertar-roles-manual.ts

import { DataSource } from 'typeorm';
import { Rol } from '../entities/rol.entity';

async function insertarRoles() {
  // Configurar conexión a la base de datos
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'sistema_facturador',
    entities: [Rol],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conectado a la base de datos');

    const rolRepository = dataSource.getRepository(Rol);

    const rolesPredefinidos = [
      {
        nombre: 'admin',
        descripcion: 'Administrador del sistema con acceso completo a todos los módulos',
      },
      {
        nombre: 'gestor de sistema',
        descripcion: 'Gestor de sistema con acceso completo para configuración y mantenimiento',
      },
      {
        nombre: 'gerente',
        descripcion: 'Gerente con acceso a módulos operativos y reportes',
      },
      {
        nombre: 'vendedor',
        descripcion: 'Vendedor con acceso a facturación, clientes y productos',
      },
      {
        nombre: 'contador',
        descripcion: 'Contador con acceso a contabilidad, facturación y reportes',
      },
      {
        nombre: 'Administrador de TI',
        descripcion: 'Administrador de TI con acceso exclusivo a operatividad técnica, sin acceso a información financiera',
      },
      {
        nombre: 'Dueño',
        descripcion: 'Dueño de la empresa con acceso completo y autorización para aprobar solicitudes de roles',
      },
    ];

    for (const rolData of rolesPredefinidos) {
      const existe = await rolRepository.findOne({
        where: { nombre: rolData.nombre },
      });

      if (!existe) {
        const rol = rolRepository.create(rolData);
        await rolRepository.save(rol);
        console.log(`✅ Rol "${rolData.nombre}" creado`);
      } else {
        console.log(`ℹ️  Rol "${rolData.nombre}" ya existe`);
      }
    }

    // Listar todos los roles
    const todosLosRoles = await rolRepository.find();
    console.log('\n📋 Roles en la base de datos:');
    todosLosRoles.forEach(rol => {
      console.log(`   - ${rol.id}: ${rol.nombre}`);
    });

    await dataSource.destroy();
    console.log('\n✅ Proceso completado');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

insertarRoles();










