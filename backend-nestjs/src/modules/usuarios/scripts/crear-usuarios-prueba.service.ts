import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../entities/rol.entity';
import { UsuarioPermiso } from '../entities/usuario-permiso.entity';

@Injectable()
export class CrearUsuariosPruebaService implements OnModuleInit {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
    @InjectRepository(UsuarioPermiso)
    private permisoRepository: Repository<UsuarioPermiso>,
  ) {}

  async onModuleInit() {
    // Esperar a que los roles estén creados
    // Intentar varias veces con retraso incremental
    let intentos = 0;
    const maxIntentos = 15;
    
    const intentarCrear = async () => {
      try {
        // Verificar que hay roles en la base de datos
        const rolesCount = await this.rolRepository.count();
        if (rolesCount > 0) {
          // Los roles están listos, crear usuarios
          await this.crearUsuariosPrueba();
        } else {
          // Aún no hay roles, esperar más
          intentos++;
          if (intentos < maxIntentos) {
            setTimeout(intentarCrear, 2000);
          } else {
            console.warn('⚠️  No se encontraron roles después de varios intentos');
            console.warn('   Los usuarios de prueba se crearán cuando los roles estén disponibles');
          }
        }
      } catch (error) {
        intentos++;
        if (intentos < maxIntentos) {
          setTimeout(intentarCrear, 2000);
        } else {
          console.error('❌ Error al crear usuarios de prueba:', error.message);
        }
      }
    };

    // Iniciar después de un delay inicial más largo
    setTimeout(intentarCrear, 5000);
  }

  async crearUsuariosPrueba() {
    const usuariosPrueba = [
      {
        nombre_usuario: 'admin',
        nombre_completo: 'Administrador del Sistema',
        password: 'admin123',
        email: 'admin@sistema.com',
        activo: 1,
        rol_nombre: 'admin',
      },
      {
        nombre_usuario: 'gestor',
        nombre_completo: 'Gestor de Sistema',
        password: 'gestor123',
        email: 'gestor@sistema.com',
        activo: 1,
        rol_nombre: 'gestor de sistema',
      },
      {
        nombre_usuario: 'gerente',
        nombre_completo: 'Gerente General',
        password: 'gerente123',
        email: 'gerente@sistema.com',
        activo: 1,
        rol_nombre: 'gerente',
      },
      {
        nombre_usuario: 'vendedor1',
        nombre_completo: 'Vendedor Principal',
        password: 'vendedor123',
        email: 'vendedor1@sistema.com',
        activo: 1,
        rol_nombre: 'vendedor',
      },
      {
        nombre_usuario: 'vendedor2',
        nombre_completo: 'Vendedor Secundario',
        password: 'vendedor123',
        email: 'vendedor2@sistema.com',
        activo: 1,
        rol_nombre: 'vendedor',
      },
      {
        nombre_usuario: 'contador',
        nombre_completo: 'Contador General',
        password: 'contador123',
        email: 'contador@sistema.com',
        activo: 1,
        rol_nombre: 'contador',
      },
    ];

    // Importar bcrypt de forma opcional
    let bcrypt: any;
    try {
      bcrypt = require('bcrypt');
    } catch (e) {
      console.warn('⚠️  bcrypt no está instalado. Usando hash temporal.');
      bcrypt = {
        hash: async (password: string) => password,
      };
    }

    for (const usuarioData of usuariosPrueba) {
      try {
        // Verificar si el usuario ya existe
        const existe = await this.usuarioRepository.findOne({
          where: { nombre_usuario: usuarioData.nombre_usuario },
        });

        if (existe) {
          console.log(`ℹ️  Usuario "${usuarioData.nombre_usuario}" ya existe`);
          continue;
        }

        // Buscar el rol
        const rol = await this.rolRepository.findOne({
          where: { nombre: usuarioData.rol_nombre },
        });

        if (!rol) {
          console.warn(`⚠️  Rol "${usuarioData.rol_nombre}" no encontrado para usuario "${usuarioData.nombre_usuario}"`);
          continue;
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(usuarioData.password, 10);

        // Crear usuario
        const usuario = this.usuarioRepository.create({
          nombre_usuario: usuarioData.nombre_usuario,
          nombre_completo: usuarioData.nombre_completo,
          password: hashedPassword,
          email: usuarioData.email,
          activo: usuarioData.activo,
          rol_id: rol.id,
        });

        const usuarioGuardado = await this.usuarioRepository.save(usuario);

        // Aplicar permisos según el rol
        await this.aplicarPermisosPorRol(usuarioGuardado.id, rol.nombre);

        console.log(`✅ Usuario de prueba "${usuarioData.nombre_usuario}" creado con rol "${rol.nombre}"`);
      } catch (error) {
        console.error(`❌ Error al crear usuario "${usuarioData.nombre_usuario}":`, error.message);
      }
    }

    console.log('');
    console.log('========================================');
    console.log('   USUARIOS DE PRUEBA CREADOS');
    console.log('========================================');
    console.log('');
    console.log('Credenciales de acceso:');
    console.log('');
    usuariosPrueba.forEach((u) => {
      console.log(`  Usuario: ${u.nombre_usuario.padEnd(15)} Contraseña: ${u.password.padEnd(15)} Rol: ${u.rol_nombre}`);
    });
    console.log('');
  }

  private async aplicarPermisosPorRol(usuarioId: number, nombreRol: string) {
    const permisosPorRol: Record<string, string[]> = {
      admin: [
        'facturacion',
        'contabilidad',
        'clientes',
        'productos',
        'inventario',
        'compras',
        'admin',
        'reportes',
      ],
      'gestor de sistema': [
        'facturacion',
        'contabilidad',
        'clientes',
        'productos',
        'inventario',
        'compras',
        'admin',
        'reportes',
      ],
      gerente: [
        'facturacion',
        'contabilidad',
        'clientes',
        'productos',
        'inventario',
        'compras',
        'reportes',
      ],
      vendedor: [
        'facturacion',
        'clientes',
        'productos',
      ],
      contador: [
        'contabilidad',
        'facturacion',
        'reportes',
      ],
    };

    const modulos = permisosPorRol[nombreRol.toLowerCase()] || [];

    // Eliminar permisos existentes
    await this.permisoRepository.delete({ usuario_id: usuarioId });

    // Crear nuevos permisos
    const permisos = modulos.map((modulo) =>
      this.permisoRepository.create({
        usuario_id: usuarioId,
        modulo,
        tiene_acceso: 1,
      }),
    );

    if (permisos.length > 0) {
      await this.permisoRepository.save(permisos);
    }
  }
}

