import { Repository } from 'typeorm';
import { Ubicacion } from './entities/ubicacion.entity';
import { ProductoUbicacion } from './entities/producto-ubicacion.entity';
import { Producto } from '../productos/entities/producto.entity';
export declare class CreateUbicacionDto {
    nombre: string;
    codigo?: string;
    tipo?: string;
    descripcion?: string;
    direccion?: string;
}
export declare class UpdateUbicacionDto {
    nombre?: string;
    codigo?: string;
    tipo?: string;
    descripcion?: string;
    direccion?: string;
    activa?: boolean;
}
export declare class AsignarProductoUbicacionDto {
    producto_id: number;
    ubicacion_id: number;
    stock: number;
    stock_minimo?: number;
    stock_maximo?: number;
    estado_stock?: string;
    observaciones?: string;
}
export declare class UbicacionesService {
    private ubicacionRepository;
    private productoUbicacionRepository;
    private productoRepository;
    constructor(ubicacionRepository: Repository<Ubicacion>, productoUbicacionRepository: Repository<ProductoUbicacion>, productoRepository: Repository<Producto>);
    findAll(): Promise<Ubicacion[]>;
    findOne(id: number): Promise<Ubicacion>;
    create(createDto: CreateUbicacionDto): Promise<Ubicacion>;
    update(id: number, updateDto: UpdateUbicacionDto): Promise<Ubicacion>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    asignarProducto(dto: AsignarProductoUbicacionDto): Promise<ProductoUbicacion>;
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
