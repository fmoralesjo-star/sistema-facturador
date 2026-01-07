import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../entities/rol.entity';
import { UsuarioPermiso } from '../entities/usuario-permiso.entity';
export declare class CrearUsuariosPruebaService implements OnModuleInit {
    private usuarioRepository;
    private rolRepository;
    private permisoRepository;
    constructor(usuarioRepository: Repository<Usuario>, rolRepository: Repository<Rol>, permisoRepository: Repository<UsuarioPermiso>);
    onModuleInit(): Promise<void>;
    crearUsuariosPrueba(): Promise<void>;
    private aplicarPermisosPorRol;
}
