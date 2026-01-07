import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from '../entities/rol.entity';

@Injectable()
export class InsertarRolesService implements OnModuleInit {
  constructor(
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
  ) {}

  async onModuleInit() {
    // Esperar a que la conexión a la base de datos esté lista
    // Intentar varias veces con retraso incremental
    let intentos = 0;
    const maxIntentos = 10;
    
    const intentarInsertar = async () => {
      try {
        // Verificar que la tabla existe intentando contar
        await this.rolRepository.count();
        // Si llegamos aquí, la tabla existe
        await this.insertarRolesPredefinidos();
      } catch (error) {
        intentos++;
        if (intentos < maxIntentos) {
          console.log(`⏳ Esperando base de datos... (intento ${intentos}/${maxIntentos})`);
          setTimeout(intentarInsertar, 1000 * intentos); // Delay incremental
        } else {
          console.error('❌ No se pudo conectar a la base de datos después de varios intentos');
          console.error('   Los roles se crearán cuando la base de datos esté disponible');
        }
      }
    };

    // Iniciar después de un pequeño delay inicial
    setTimeout(intentarInsertar, 1000);
  }

  async insertarRolesPredefinidos() {
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
      const existe = await this.rolRepository.findOne({
        where: { nombre: rolData.nombre },
      });

      if (!existe) {
        const rol = this.rolRepository.create(rolData);
        await this.rolRepository.save(rol);
        console.log(`✅ Rol "${rolData.nombre}" creado`);
      } else {
        console.log(`ℹ️  Rol "${rolData.nombre}" ya existe`);
      }
    }
  }
}

