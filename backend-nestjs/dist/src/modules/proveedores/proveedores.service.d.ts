import { Repository } from 'typeorm';
import { Proveedor } from '../compras/entities/proveedor.entity';
export declare class ProveedoresService {
    private readonly proveedorRepository;
    constructor(proveedorRepository: Repository<Proveedor>);
    create(data: any): Promise<Proveedor>;
    findAll(): Promise<Proveedor[]>;
    findOne(id: number): Promise<Proveedor>;
    update(id: number, data: any): Promise<Proveedor>;
    remove(id: number): Promise<void>;
}
