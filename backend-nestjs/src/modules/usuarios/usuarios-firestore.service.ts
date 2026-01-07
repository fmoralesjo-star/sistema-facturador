import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { FirestoreService } from '../firebase/firestore.service';
import { EventsGateway } from '../../gateways/events.gateway';

@Injectable()
export class UsuariosFirestoreService {
  private readonly usuariosCollection = 'usuarios';
  private readonly rolesCollection = 'roles';
  private readonly permisosCollection = 'usuario_permisos';

  constructor(
    private firestoreService: FirestoreService,
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway,
  ) {}

  // ========== ROLES ==========
  async findAllRoles() {
    if (!this.firestoreService.isAvailable()) {
      return this.getRolesDefault();
    }
    
    const roles = await this.firestoreService.findAll<any>(
      this.rolesCollection,
      undefined,
      { field: 'nombre', direction: 'asc' },
    );

    // Si no hay roles, crear los roles por defecto
    if (roles.length === 0) {
      return await this.crearRolesDefault();
    }

    return roles;
  }

  async findOneRol(id: string) {
    if (!this.firestoreService.isAvailable()) {
      return null;
    }
    return await this.firestoreService.findOne(this.rolesCollection, id);
  }

  private getRolesDefault() {
    return [
      { id: '1', nombre: 'admin', descripcion: 'Administrador del sistema' },
      { id: '2', nombre: 'gestor de sistema', descripcion: 'Gestor de sistema' },
      { id: '3', nombre: 'gerente', descripcion: 'Gerente' },
      { id: '4', nombre: 'vendedor', descripcion: 'Vendedor' },
      { id: '5', nombre: 'contador', descripcion: 'Contador' },
      { id: '6', nombre: 'Administrador de TI', descripcion: 'Administrador de TI' },
      { id: '7', nombre: 'Dueño', descripcion: 'Dueño de la empresa' },
    ];
  }

  private async crearRolesDefault() {
    const rolesDefault = this.getRolesDefault();
    const rolesCreados = [];

    for (const rol of rolesDefault) {
      try {
        const rolExistente = await this.firestoreService.findByField(
          this.rolesCollection,
          'nombre',
          rol.nombre,
        );

        if (rolExistente.length === 0) {
          const id = await this.firestoreService.create(this.rolesCollection, {
            nombre: rol.nombre,
            descripcion: rol.descripcion,
            created_at: new Date(),
            updated_at: new Date(),
          });
          rolesCreados.push({ id, ...rol });
        } else {
          rolesCreados.push({ id: rolExistente[0].id, ...rolExistente[0] });
        }
      } catch (error) {
        console.error(`Error al crear rol ${rol.nombre}:`, error);
      }
    }

    return rolesCreados;
  }

  // ========== USUARIOS ==========
  async findAll() {
    if (!this.firestoreService.isAvailable()) {
      return [];
    }
    return await this.firestoreService.findAll<any>(
      this.usuariosCollection,
      undefined,
      { field: 'nombre_completo', direction: 'asc' },
    );
  }

  async findOne(id: string) {
    if (!this.firestoreService.isAvailable()) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    const usuario = await this.firestoreService.findOne(this.usuariosCollection, id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  async findByEmail(email: string) {
    if (!this.firestoreService.isAvailable()) {
      return null;
    }
    const usuarios = await this.firestoreService.findByField(
      this.usuariosCollection,
      'email',
      email,
    );
    return usuarios.length > 0 ? usuarios[0] : null;
  }

  async create(data: any) {
    if (!this.firestoreService.isAvailable()) {
      throw new Error('Firestore no está disponible');
    }

    // Verificar si el email ya existe
    if (data.email) {
      const existente = await this.findByEmail(data.email);
      if (existente) {
        throw new Error('El email ya está en uso');
      }
    }

    const usuarioData = {
      ...data,
      activo: data.activo ?? 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const id = await this.firestoreService.create(this.usuariosCollection, usuarioData);
    
    if (this.eventsGateway) {
      this.eventsGateway.emitUsuarioCreado({ id, ...usuarioData });
    }

    return { id, ...usuarioData };
  }

  async update(id: string, data: any) {
    if (!this.firestoreService.isAvailable()) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const usuario = await this.findOne(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Verificar si el email cambió y ya existe
    if (data.email && data.email !== usuario.email) {
      const existente = await this.findByEmail(data.email);
      if (existente) {
        throw new Error('El email ya está en uso');
      }
    }

    const updatedData = {
      ...data,
      updated_at: new Date(),
    };

    await this.firestoreService.update(this.usuariosCollection, id, updatedData);

    if (this.eventsGateway) {
      this.eventsGateway.emitUsuarioActualizado({ id, ...updatedData });
    }

    return { id, ...usuario, ...updatedData };
  }

  async remove(id: string) {
    if (!this.firestoreService.isAvailable()) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const usuario = await this.findOne(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.firestoreService.delete(this.usuariosCollection, id);

    if (this.eventsGateway) {
      this.eventsGateway.emitUsuarioEliminado(id);
    }

    return { id };
  }

  // ========== PERMISOS ==========
  async getPermisos(usuarioId: string) {
    if (!this.firestoreService.isAvailable()) {
      return [];
    }

    const permisos = await this.firestoreService.findByField(
      this.permisosCollection,
      'usuario_id',
      usuarioId,
    );

    return permisos;
  }

  async updatePermisos(usuarioId: string, permisos: any[]) {
    if (!this.firestoreService.isAvailable()) {
      throw new Error('Firestore no está disponible');
    }

    // Eliminar permisos existentes
    const permisosExistentes = await this.getPermisos(usuarioId);
    for (const permiso of permisosExistentes) {
      await this.firestoreService.delete(this.permisosCollection, permiso.id);
    }

    // Crear nuevos permisos
    for (const permiso of permisos) {
      await this.firestoreService.create(this.permisosCollection, {
        usuario_id: usuarioId,
        modulo: permiso.modulo,
        tiene_acceso: permiso.tiene_acceso ? 1 : 0,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    return permisos;
  }

  // ========== SYNC FIREBASE ==========
  async syncFirebaseUser(firebase_uid: string, email: string, nombre_completo: string) {
    if (!this.firestoreService.isAvailable()) {
      throw new Error('Firestore no está disponible');
    }

    // Buscar usuario por email
    let usuario = await this.findByEmail(email);

    if (usuario) {
      // Actualizar con firebase_uid si no lo tiene
      if (!usuario.firebase_uid) {
        await this.update(usuario.id, {
          firebase_uid,
          nombre_completo: nombre_completo || usuario.nombre_completo,
        });
        return { id: usuario.id, ...usuario, firebase_uid };
      }
      return usuario;
    } else {
      // Crear nuevo usuario
      return await this.create({
        firebase_uid,
        email,
        nombre_completo,
        nombre_usuario: email,
        activo: 1,
      });
    }
  }

  // ========== PERMISOS POR ROL ==========
  getPermisosPorRol(nombreRol: string): string[] {
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
        'clientes',
        'productos',
        'inventario',
        'compras',
        'admin',
        'reportes',
      ],
      gerente: [
        'facturacion',
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
        'reportes',
      ],
      'Administrador de TI': [
        'admin',
      ],
      'Dueño': [
        'facturacion',
        'contabilidad',
        'clientes',
        'productos',
        'inventario',
        'compras',
        'admin',
        'reportes',
      ],
    };

    return permisosPorRol[nombreRol] || [];
  }
}

