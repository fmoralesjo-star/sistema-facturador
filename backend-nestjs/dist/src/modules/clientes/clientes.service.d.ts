import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { EventsGateway } from '../../gateways/events.gateway';
export declare class CreateClienteDto {
    nombre: string;
    ruc?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    fechaNacimiento?: string;
    esExtranjero?: boolean;
}
export declare class UpdateClienteDto {
    nombre?: string;
    ruc?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    fechaNacimiento?: string;
    esExtranjero?: boolean;
}
export declare class ClientesService {
    private clienteRepository;
    private eventsGateway;
    constructor(clienteRepository: Repository<Cliente>, eventsGateway: EventsGateway);
    findAll(): Promise<Cliente[]>;
    findOne(id: number): Promise<Cliente>;
    findByRuc(ruc: string): Promise<Cliente>;
    create(createDto: CreateClienteDto): Promise<Cliente>;
    update(id: number, updateDto: UpdateClienteDto): Promise<Cliente>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    getHistorialCompras(clienteId: number, limit?: number): Promise<{
        cliente: {
            id: number;
            nombre: string;
            ruc: string;
            email: string;
        };
        facturas: any;
        total_facturas: any;
    }>;
    getProductosFrecuentes(clienteId: number, limit?: number): Promise<any>;
    getEstadisticas(clienteId: number): Promise<{
        cliente: {
            id: number;
            nombre: string;
            ruc: string;
            tipo_cliente: string;
            limite_credito: number;
        };
        resumen: any;
        productos_unicos_comprados: number;
        compras_por_mes: any;
    }>;
    actualizarTotalesCliente(clienteId: number): Promise<any>;
}
