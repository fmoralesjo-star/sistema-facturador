import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { EventsGateway } from '../../gateways/events.gateway';
export declare class CreateProductoDto {
    num_movimiento?: string;
    fecha_movimiento?: Date | string;
    codigo: string;
    grupo_comercial?: string;
    referencia?: string;
    sku?: string;
    nombre: string;
    descripcion?: string;
    coleccion?: string;
    categoria?: string;
    talla?: string;
    color?: string;
    desc_color?: string;
    cod_barras?: string;
    precio_costo?: number;
    precio: number;
    unidad?: string;
    stock?: number;
    punto_reorden?: number;
    stock_seguridad?: number;
    tiempo_entrega_dias?: number;
}
export declare class UpdateProductoDto {
    num_movimiento?: string;
    fecha_movimiento?: Date | string;
    codigo?: string;
    grupo_comercial?: string;
    referencia?: string;
    sku?: string;
    nombre?: string;
    descripcion?: string;
    coleccion?: string;
    categoria?: string;
    talla?: string;
    color?: string;
    desc_color?: string;
    cod_barras?: string;
    precio_costo?: number;
    precio?: number;
    unidad?: string;
    stock?: number;
    punto_reorden?: number;
    stock_seguridad?: number;
    tiempo_entrega_dias?: number;
}
export declare class ProductosService {
    private productoRepository;
    private eventsGateway;
    constructor(productoRepository: Repository<Producto>, eventsGateway: EventsGateway);
    findAll(): Promise<Producto[]>;
    findByCodigoOrBarrasOrSku(codigo?: string, codBarras?: string, sku?: string): Promise<Producto[]>;
    findOne(id: number): Promise<Producto>;
    create(createDto: CreateProductoDto): Promise<Producto>;
    update(id: number, updateDto: UpdateProductoDto): Promise<Producto>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    crearProductoEjemplo(): Promise<{
        success: boolean;
        message: string;
        producto: Producto;
    }>;
    crearProductosMasivos(productosDto: CreateProductoDto[]): Promise<{
        exitosos: any[];
        fallidos: any[];
        total: number;
    }>;
}
