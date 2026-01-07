import { UbicacionesService, CreateUbicacionDto, UpdateUbicacionDto, AsignarProductoUbicacionDto } from './ubicaciones.service';
export declare class UbicacionesController {
    private readonly ubicacionesService;
    constructor(ubicacionesService: UbicacionesService);
    findAll(): Promise<import("./entities/ubicacion.entity").Ubicacion[]>;
    findOne(id: number): Promise<import("./entities/ubicacion.entity").Ubicacion>;
    create(createDto: CreateUbicacionDto): Promise<import("./entities/ubicacion.entity").Ubicacion>;
    update(id: number, updateDto: UpdateUbicacionDto): Promise<import("./entities/ubicacion.entity").Ubicacion>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    asignarProducto(dto: AsignarProductoUbicacionDto): Promise<import("./entities/producto-ubicacion.entity").ProductoUbicacion>;
    obtenerStockPorUbicacion(productoId: number): Promise<{
        ubicacion_id: number;
        ubicacion_nombre: string;
        ubicacion_codigo: string;
        ubicacion_tipo: string;
        stock: number;
        stock_minimo: number;
        stock_maximo: number;
        estado_stock: string;
    }[]>;
    obtenerProductosPorUbicacion(ubicacionId: number): Promise<{
        id: number;
        codigo: string;
        sku: string;
        nombre: string;
        precio: number;
        stock: number;
        stock_minimo: number;
        stock_maximo: number;
        estado_stock: string;
        ubicacion_nombre: string;
        ubicacion_codigo: string;
    }[]>;
}
