import { Repository } from 'typeorm';
import { LoteInventario } from './entities/lote-inventario.entity';
import { Producto } from '../productos/entities/producto.entity';
export declare class ValoracionInventarioService {
    private loteRepository;
    private productoRepository;
    constructor(loteRepository: Repository<LoteInventario>, productoRepository: Repository<Producto>);
    registrarLote(data: {
        producto_id: number;
        numero_lote?: string;
        fecha_entrada: Date;
        fecha_vencimiento?: Date;
        cantidad: number;
        costo_unitario: number;
        precio_venta?: number;
        proveedor?: string;
        referencia_compra?: string;
    }): Promise<LoteInventario>;
    aplicarSalidaFIFO(productoId: number, cantidad: number): Promise<{
        lotes_utilizados: {
            lote_id: number;
            cantidad: number;
            costo_unitario: number;
        }[];
        costo_total: number;
        cantidad_atendida: number;
        cantidad_faltante: number;
    }>;
    calcularValoracionFIFO(productoId: number): Promise<{
        producto_id: number;
        cantidad_total: number;
        valoracion_total: number;
        costo_promedio: number;
        lotes_activos: number;
    }>;
    actualizarCostoPromedio(productoId: number): Promise<number>;
    obtenerLotesDisponibles(productoId: number): Promise<LoteInventario[]>;
    obtenerValoracionTotalInventario(): Promise<{
        valoracion_total: number;
        productos: any[];
    }>;
}
