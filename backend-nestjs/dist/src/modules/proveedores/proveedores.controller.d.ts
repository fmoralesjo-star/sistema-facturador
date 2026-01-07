import { ProveedoresService } from './proveedores.service';
export declare class ProveedoresController {
    private readonly proveedoresService;
    constructor(proveedoresService: ProveedoresService);
    create(createProveedorDto: any): Promise<import("../compras/entities/proveedor.entity").Proveedor>;
    findAll(): Promise<import("../compras/entities/proveedor.entity").Proveedor[]>;
    findOne(id: number): Promise<import("../compras/entities/proveedor.entity").Proveedor>;
    update(id: number, updateProveedorDto: any): Promise<import("../compras/entities/proveedor.entity").Proveedor>;
    remove(id: number): Promise<void>;
}
