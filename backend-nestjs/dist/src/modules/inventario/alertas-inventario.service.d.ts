import { Repository } from 'typeorm';
import { Producto } from '../productos/entities/producto.entity';
export interface AlertaInventario {
    tipo: string;
    producto_id: number;
    producto_nombre: string;
    producto_codigo: string;
    sku?: string;
    stock_actual: number;
    punto_reorden?: number;
    stock_seguridad?: number;
    mensaje: string;
    severidad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
}
export declare class AlertasInventarioService {
    private productoRepository;
    constructor(productoRepository: Repository<Producto>);
    calcularPuntoReordenSugerido(demandaPromedioDiaria: number, tiempoEntregaDias: number, stockSeguridad?: number): number;
    obtenerAlertas(): Promise<AlertaInventario[]>;
    evaluarAlertasProducto(producto: Producto): AlertaInventario[];
    obtenerResumenAlertas(): Promise<{
        total: number;
        criticas: number;
        altas: number;
        medias: number;
        bajas: number;
        alertas: AlertaInventario[];
    }>;
    obtenerProductosReorden(): Promise<{
        id: number;
        codigo: string;
        sku: string;
        nombre: string;
        stock_actual: number;
        punto_reorden: number;
        stock_seguridad: number;
        tiempo_entrega_dias: number;
        diferencia: number;
        urgencia: string;
    }[]>;
}
