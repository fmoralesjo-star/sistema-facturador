import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Rol } from '../entities/rol.entity';
export declare class InsertarRolesService implements OnModuleInit {
    private rolRepository;
    constructor(rolRepository: Repository<Rol>);
    onModuleInit(): Promise<void>;
    insertarRolesPredefinidos(): Promise<void>;
}
