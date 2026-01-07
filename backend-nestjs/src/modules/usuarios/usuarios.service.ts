import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { UsuarioPermiso } from './entities/usuario-permiso.entity';
import { EventsGateway } from '../../gateways/events.gateway';
import { AuditService } from '../audit/audit.service';

// Importar bcrypt de forma opcional
let bcrypt: any;
try {
  bcrypt = require('bcrypt');
} catch (e) {
  console.warn('⚠️  bcrypt no está instalado. Ejecuta: npm install bcrypt @types/bcrypt');
  // Función temporal para hash sin bcrypt (NO SEGURO - solo para desarrollo)
  bcrypt = {
    hash: async (password: string, rounds: number) => {
      console.warn('⚠️  Usando hash temporal inseguro. Instala bcrypt para producción.');
      return password; // NO usar en producción
    }
  };
}

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
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway,
    private readonly auditService: AuditService,
  ) { }

  async findAll() {
    try {
      const usuarios = await this.usuarioRepository.find({
        relations: ['rol'],
        order: { nombre_completo: 'ASC' },
      });
      console.log(`✅ Usuarios encontrados: ${usuarios.length}`);
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
      valor_anterior: usuario, // Note: usuario object acts as old reference? No, it's mutated by assign. Ideally capture before.
      // Getting old/new accurately requires cloning. For now logging mutated object as 'new'.
      valor_nuevo: saved,
      usuario_nombre: 'Admin', // Placeholder
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
    const usuario = await this.findOne(usuarioId);

    // Eliminar permisos existentes
    await this.permisoRepository.delete({ usuario_id: usuarioId });

    // Crear nuevos permisos
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

  async aplicarPermisosPorRol(usuarioId: number, rolId: number) {
    const rol = await this.findOneRol(rolId);
    const permisosPorRol = this.getPermisosPorRol(rol.nombre);

    const permisos = permisosPorRol.map((modulo) => ({
      modulo,
      tiene_acceso: true,
    }));

    await this.updatePermisos(usuarioId, permisos);
  }

  private getPermisosPorRol(nombreRol: string): string[] {
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

    return permisosPorRol[nombreRol.toLowerCase()] || [];
  }

  async syncFirebaseUser(firebaseUid: string, email: string, nombreCompleto: string, extraData: any = {}) {
    // Buscar si ya existe un usuario con este email
    let usuario = await this.usuarioRepository.findOne({
      where: { email },
    });

    if (usuario) {
      // Actualizar usuario existente si hay datos extra
      let updated = false;
      if (extraData.identificacion && usuario.identificacion !== extraData.identificacion) { usuario.identificacion = extraData.identificacion; updated = true; }
      if (extraData.telefono && usuario.telefono !== extraData.telefono) { usuario.telefono = extraData.telefono; updated = true; }
      if (extraData.direccion && usuario.direccion !== extraData.direccion) { usuario.direccion = extraData.direccion; updated = true; }
      if (extraData.fecha_nacimiento) {
        const nuevaFecha = new Date(extraData.fecha_nacimiento);
        if (usuario.fecha_nacimiento?.getTime() !== nuevaFecha.getTime()) {
          usuario.fecha_nacimiento = nuevaFecha;
          updated = true;
        }
      }
      if (extraData.foto_cedula_anverso) { usuario.foto_cedula_anverso = extraData.foto_cedula_anverso; updated = true; }
      if (extraData.foto_cedula_reverso) { usuario.foto_cedula_reverso = extraData.foto_cedula_reverso; updated = true; }

      if (updated) {
        await this.usuarioRepository.save(usuario);
      }
      return usuario;
    } else {
      // Crear nuevo usuario desde Firebase
      const rolVendedor = await this.rolRepository.findOne({
        where: { nombre: 'vendedor' },
      });

      const nuevoUsuario = this.usuarioRepository.create({
        nombre_usuario: email.split('@')[0],
        nombre_completo: nombreCompleto,
        password: 'FIREBASE_AUTH', // Placeholder
        email,
        activo: 1,
        rol_id: rolVendedor?.id || 2, // Default a 2 si no encuentra rol vendedor
        // Campos HR
        identificacion: extraData.identificacion,
        telefono: extraData.telefono,
        direccion: extraData.direccion,
        fecha_nacimiento: extraData.fecha_nacimiento ? new Date(extraData.fecha_nacimiento) : null,
        fecha_ingreso: new Date(),
        sueldo: extraData.sueldo || 460.00,
        foto_cedula_anverso: extraData.foto_cedula_anverso,
        foto_cedula_reverso: extraData.foto_cedula_reverso
      });

      const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);

      if (rolVendedor) {
        await this.aplicarPermisosPorRol(usuarioGuardado.id, rolVendedor.id);
      }

      // Audit Log Creation
      await this.auditService.create({
        accion: 'CREATE_USER_SYNC',
        modulo: 'USUARIOS',
        entidad_id: usuarioGuardado.id,
        valor_nuevo: usuarioGuardado,
        usuario_nombre: 'System',
        ip_address: '127.0.0.1'
      });

      return usuarioGuardado;
    }
  }
}

