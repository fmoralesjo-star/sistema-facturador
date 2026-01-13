import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { UsuarioPermiso } from './entities/usuario-permiso.entity';
import { RolPermiso } from './entities/rol-permiso.entity';
import { EventsGateway } from '../../gateways/events.gateway';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcrypt';

import { IsString, IsOptional, IsInt, IsEmail, IsBoolean } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  nombre_usuario: string;

  @IsString()
  nombre_completo: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  activo?: number;

  @IsOptional()
  @IsInt()
  rol_id?: number;
}

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  nombre_usuario?: string;

  @IsOptional()
  @IsString()
  nombre_completo?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  activo?: number;

  @IsOptional()
  @IsInt()
  rol_id?: number;
}

export class PermisoDto {
  @IsString()
  modulo: string;

  @IsBoolean()
  tiene_acceso: boolean;
}

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
    @InjectRepository(UsuarioPermiso)
    private permisoRepository: Repository<UsuarioPermiso>,
    @InjectRepository(RolPermiso)
    private rolPermisoRepository: Repository<RolPermiso>,
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway,
    private readonly auditService: AuditService,
  ) { }

  async onModuleInit() {
    await this.seedRolPermisos();
  }

  // Seeding inicial de permisos por rol
  async seedRolPermisos() {
    // console.log('🔄 Verificando permisos de roles...');
    const roles = await this.rolRepository.find();

    // Mapa de permisos hardcoded (para inicializar)
    const permisosMap: Record<string, string[]> = {
      admin: [
        'dashboard', 'facturacion', 'notas_credito', 'proformas', 'clientes', 'productos', 'inventario', 'promociones',
        'compras', 'proveedores', 'contabilidad', 'tesoreria', 'bancos', 'cartera', 'recursos_humanos',
        'reportes', 'admin', 'auditoría', 'administracion_ti', 'tienda', 'sri'
      ],
      'gestor de sistema': [
        'dashboard', 'facturacion', 'notas_credito', 'proformas', 'clientes', 'productos', 'inventario', 'promociones',
        'compras', 'proveedores', 'contabilidad', 'tesoreria', 'bancos', 'reportes', 'admin'
      ],
      gerente: [
        'dashboard', 'facturacion', 'notas_credito', 'clientes', 'productos', 'inventario', 'compras', 'proveedores',
        'contabilidad', 'reportes', 'cartera', 'recursos_humanos', 'tesoreria', 'bancos'
      ],
      vendedor: [
        'dashboard', 'facturacion', 'clientes', 'productos', 'promociones', 'proformas'
      ],
      contador: [
        'dashboard', 'contabilidad', 'facturacion', 'notas_credito', 'compras', 'proveedores', 'reportes',
        'tesoreria', 'bancos', 'cartera', 'sri'
      ]
    };

    for (const rol of roles) {
      const permisosExistentes = await this.rolPermisoRepository.count({ where: { rol_id: rol.id } });

      if (permisosExistentes === 0) {
        const modulos = permisosMap[rol.nombre.toLowerCase()] || [];
        if (modulos.length > 0) {
          console.log(`✨ Inicializando permisos para rol: ${rol.nombre}`);
          const entidades = modulos.map(modulo => this.rolPermisoRepository.create({
            rol_id: rol.id,
            modulo
          }));
          await this.rolPermisoRepository.save(entidades);
        }
      }
    }
  }

  async findAll() {
    try {
      const usuarios = await this.usuarioRepository.find({
        relations: ['rol'],
        order: { nombre_completo: 'ASC' },
      });
      // console.log(`✅ Usuarios encontrados: ${usuarios.length}`);
      return usuarios;
    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error);
      throw error;
    }
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['rol', 'permisos'],
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  async findByUsername(nombre_usuario: string) {
    return this.usuarioRepository.findOne({
      where: { nombre_usuario },
      relations: ['rol', 'permisos'],
    });
  }

  async create(createDto: CreateUsuarioDto) {
    // Verificar si el usuario ya existe
    const existe = await this.usuarioRepository.findOne({
      where: { nombre_usuario: createDto.nombre_usuario },
    });
    if (existe) {
      throw new BadRequestException('El nombre de usuario ya existe');
    }

    // Verificar rol si se proporciona
    if (createDto.rol_id) {
      const rol = await this.rolRepository.findOne({ where: { id: createDto.rol_id } });
      if (!rol) {
        throw new NotFoundException(`Rol con ID ${createDto.rol_id} no encontrado`);
      }
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createDto.password, 10);

    const usuario = this.usuarioRepository.create({
      ...createDto,
      password: hashedPassword,
      activo: createDto.activo ?? 1,
    });

    const saved = await this.usuarioRepository.save(usuario);

    // Aplicar permisos del rol si existe
    if (saved.rol_id) {
      await this.aplicarPermisosPorRol(saved.id, saved.rol_id);
    }

    // AUDIT LOG
    await this.auditService.create({
      accion: 'CREATE_USER',
      modulo: 'USUARIOS',
      entidad_id: saved.id,
      valor_nuevo: saved,
      usuario_nombre: 'Admin', // Placeholder
      ip_address: '127.0.0.1'
    });

    return saved;
  }

  async update(id: number, updateDto: UpdateUsuarioDto) {
    const usuario = await this.findOne(id);

    // Verificar si se cambia el nombre de usuario
    if (updateDto.nombre_usuario && updateDto.nombre_usuario !== usuario.nombre_usuario) {
      const existe = await this.usuarioRepository.findOne({
        where: { nombre_usuario: updateDto.nombre_usuario },
      });
      if (existe) {
        throw new BadRequestException('El nombre de usuario ya existe');
      }
    }

    // Verificar rol si se proporciona
    if (updateDto.rol_id) {
      const rol = await this.rolRepository.findOne({ where: { id: updateDto.rol_id } });
      if (!rol) {
        throw new NotFoundException(`Rol con ID ${updateDto.rol_id} no encontrado`);
      }

      // Si cambia el rol, aplicar nuevos permisos
      if (updateDto.rol_id !== usuario.rol_id) {
        await this.aplicarPermisosPorRol(id, updateDto.rol_id);
      }
    }

    // Hash de la contraseña si se proporciona
    if (updateDto.password) {
      updateDto.password = await bcrypt.hash(updateDto.password, 10);
    }

    Object.assign(usuario, updateDto);
    const saved = await this.usuarioRepository.save(usuario);

    // AUDIT LOG
    await this.auditService.create({
      accion: 'UPDATE_USER',
      modulo: 'USUARIOS',
      entidad_id: saved.id,
      valor_anterior: usuario,
      valor_nuevo: saved,
      usuario_nombre: 'Admin',
      ip_address: '127.0.0.1'
    });

    return saved;
  }

  async remove(id: number) {
    const usuario = await this.findOne(id);

    // No permitir eliminar el usuario admin por defecto
    if (usuario.nombre_usuario === 'admin') {
      throw new BadRequestException('No se puede eliminar el usuario administrador');
    }

    try {
      await this.usuarioRepository.remove(usuario);

      // AUDIT LOG
      await this.auditService.create({
        accion: 'DELETE_USER',
        modulo: 'USUARIOS',
        entidad_id: id,
        valor_anterior: usuario,
        usuario_nombre: 'Admin',
        ip_address: '127.0.0.1'
      });

      return { success: true, message: 'Usuario eliminado permanentemente' };
    } catch (error) {
      if (error.code === '23503') { // Foreign key violation
        usuario.activo = 0;
        await this.usuarioRepository.save(usuario);
        return { success: true, message: 'El usuario tiene registros asociados. Se ha desactivado en lugar de eliminarlo.' };
      }
      throw error;
    }
  }

  async getPermisos(usuarioId: number) {
    return this.permisoRepository.find({
      where: { usuario_id: usuarioId },
    });
  }

  async updatePermisos(usuarioId: number, permisos: PermisoDto[]) {
    await this.permisoRepository.delete({ usuario_id: usuarioId });

    const nuevosPermisos = permisos.map((permiso) =>
      this.permisoRepository.create({
        usuario_id: usuarioId,
        modulo: permiso.modulo,
        tiene_acceso: permiso.tiene_acceso ? 1 : 0,
      }),
    );

    await this.permisoRepository.save(nuevosPermisos);
    return this.getPermisos(usuarioId);
  }

  // Métodos para gestión de roles
  async findAllRoles() {
    return this.rolRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async findOneRol(id: number) {
    const rol = await this.rolRepository.findOne({ where: { id } });
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    return rol;
  }

  async findRolByName(nombre: string) {
    return this.rolRepository.findOne({ where: { nombre } });
  }

  async aplicarPermisosPorRol(usuarioId: number, rolId: number) {
    const rolPermisos = await this.rolPermisoRepository.find({ where: { rol_id: rolId } });

    // Si encontramos permisos en la BD, los usamos
    if (rolPermisos.length > 0) {
      const permisos = rolPermisos.map((p) => ({
        modulo: p.modulo,
        tiene_acceso: true,
      }));
      await this.updatePermisos(usuarioId, permisos);
    } else {
      // Fallback or empty
    }
  }

  // Gestión de Permisos por Rol (Default)
  async getRolPermisos(rolId: number) {
    const permisos = await this.rolPermisoRepository.find({ where: { rol_id: rolId } });
    return permisos;
  }

  async updateRolPermisos(rolId: number, modulos: string[]) {
    // 1. Validar que el rol exista
    await this.findOneRol(rolId);

    // 2. Eliminar permisos anteriores
    await this.rolPermisoRepository.delete({ rol_id: rolId });

    // 3. Crear nuevos
    if (modulos.length > 0) {
      const nuevos = modulos.map(modulo => this.rolPermisoRepository.create({
        rol_id: rolId,
        modulo
      }));
      await this.rolPermisoRepository.save(nuevos);
    }

    return this.getRolPermisos(rolId);
  }
}
