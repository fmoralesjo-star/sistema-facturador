import { CreateClienteDto, UpdateClienteDto } from './clientes.service';
export declare class ClientesController {
    private readonly clientesService;
    constructor(clientesService: any);
    findAll(): any;
    findByRuc(ruc: string): any;
    findOne(id: string | number): any;
    create(createDto: CreateClienteDto): any;
    update(id: string | number, updateDto: UpdateClienteDto): any;
    remove(id: string | number): any;
    getHistorialCompras(id: number): any;
    getProductosFrecuentes(id: number): any;
    getEstadisticas(id: number): any;
    actualizarTotales(id: number): any;
}
