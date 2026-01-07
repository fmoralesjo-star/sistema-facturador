import { Repository, QueryRunner } from 'typeorm';
import { MovimientoInventario } from './entities/movimiento-inventario.entity';
import { Producto } from '../productos/entities/producto.entity';
import { ProductoUbicacion } from './entities/producto-ubicacion.entity';
import { ProductoPuntoVenta } from './entities/producto-punto-venta.entity';
import { AlertasInventarioService } from './alertas-inventario.service';
import { ValoracionInventarioService } from './valoracion-inventario.service';
import { ContabilidadService } from '../contabilidad/contabilidad.service';
import { EventsGateway } from '../../gateways/events.gateway';
export interface CreateMovimientoDto {
    producto_id: number;
    tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
    cantidad: number;
    motivo?: string;
    observaciones?: string;
    factura_id?: number;
    compra_id?: number;
    fecha?: Date | string;
    punto_venta_id?: number;
}
export declare class InventarioService {
    private movimientoRepository;
    private productoRepository;
    private productoUbicacionRepository;
    private productoPuntoVentaRepository;
    private alertasService;
    private valoracionService;
    private contabilidadService;
    private eventsGateway?;
    constructor(movimientoRepository: Repository<MovimientoInventario>, productoRepository: Repository<Producto>, productoUbicacionRepository: Repository<ProductoUbicacion>, productoPuntoVentaRepository: Repository<ProductoPuntoVenta>, alertasService: AlertasInventarioService, valoracionService: ValoracionInventarioService, contabilidadService: ContabilidadService, eventsGateway?: EventsGateway);
    registrarMovimiento(dto: CreateMovimientoDto, queryRunner?: QueryRunner): Promise<MovimientoInventario>;
    registrarMovimientoConActualizacion(dto: CreateMovimientoDto, queryRunner?: QueryRunner): Promise<MovimientoInventario>;
    obtenerKardex(productoId: number, puntoVentaId?: number): Promise<{
        producto: Producto;
        stock_inicial: number;
        stock_actual: number;
        movimientos: {
            stock_despues: number;
            bodega: {
                id: number;
                nombre: string;
                codigo: string;
            };
            id: number;
            producto: Producto;
            producto_id: number;
            fecha: Date;
            tipo: string;
            cantidad: number;
            motivo: string;
            observaciones: string;
            factura: import("../facturas/entities/factura.entity").Factura;
            factura_id: number;
            compra_id: number;
            puntoVenta: import("../puntos-venta/entities/punto-venta.entity").PuntoVenta;
            punto_venta_id: number;
            created_at: Date;
        }[];
        total_entradas: number;
        total_salidas: number;
    }>;
    obtenerInventario(): Promise<{
        id: number;
        codigo: string;
        sku: string;
        nombre: string;
        descripcion: string;
        precio: number;
        stock_actual: number;
        activo: boolean;
        punto_reorden: number;
        stock_seguridad: number;
        tiempo_entrega_dias: number;
        costo_promedio: number;
        ubicaciones: {
            ubicacion_id: number;
            ubicacion_nombre: string;
            ubicacion_codigo: string;
            ubicacion_tipo: string;
            stock: number;
            estado_stock: string;
        }[];
        desglose_stock: {
            punto_venta_id: number;
            nombre: string;
            codigo: string;
            stock: number;
        }[];
        total_ubicaciones: number;
    }[]>;
    obtenerMovimientos(): Promise<{
        id: number;
        fecha: Date;
        tipo: string;
        cantidad: number;
        motivo: string;
        observaciones: string;
        producto_id: number;
        producto: {
            id: number;
            nombre: string;
            codigo: string;
            sku: string;
        };
        producto_nombre: string;
        codigo: string;
        sku: string;
        factura_id: number;
        factura_numero: string;
        compra_id: number;
        stock_anterior: number;
        stock_nuevo: number;
        usuario: any;
    }[]>;
    obtenerEstadisticas(): Promise<{
        total_productos: number;
        stock_total: number;
        productos_stock_bajo: number;
        productos_sin_stock: number;
        valor_total: number;
        ventas_hoy: number;
        costo_ventas_hoy: number;
    }>;
    obtenerStockBajo(limite?: number): Promise<{
        id: number;
        codigo: string;
        sku: string;
        nombre: string;
        stock: number;
        precio: number;
    }[]>;
    obtenerAlertas(): Promise<import("./alertas-inventario.service").AlertaInventario[]>;
    obtenerResumenAlertas(): Promise<{
        total: number;
        criticas: number;
        altas: number;
        medias: number;
        bajas: number;
        alertas: import("./alertas-inventario.service").AlertaInventario[];
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
    obtenerValoracionTotalInventario(): Promise<{
        valoracion_total: number;
        productos: any[];
    }>;
    obtenerInventarioPorPuntoVenta(puntoVentaId: number): Promise<{
        stock_punto_venta: number;
        referencia: string;
        id: number;
        num_movimiento: string;
        fecha_movimiento: Date;
        codigo: string;
        grupo_comercial: string;
        sku: string;
        nombre: string;
        descripcion: string;
        coleccion: string;
        categoria: string;
        talla: string;
        color: string;
        desc_color: string;
        cod_barras: string;
        precio_costo: number;
        precio: number;
        unidad: string;
        stock: number;
        tipo_impuesto: string;
        punto_reorden: number;
        stock_seguridad: number;
        tiempo_entrega_dias: number;
        costo_promedio: number;
        activo: boolean;
        detallesFactura: import("../facturas/entities/factura-detalle.entity").FacturaDetalle[];
        movimientos: MovimientoInventario[];
        created_at: Date;
        updated_at: Date;
        deleted_at: Date;
    }[]>;
    actualizarStockPuntoVenta(productoId: number, puntoVentaId: number, cantidad: number, tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE', queryRunner?: QueryRunner): Promise<{
        stock_anterior: number;
        stock_nuevo: number;
    }>;
    transferirStock(productoId: number, puntoVentaOrigen: number, puntoVentaDestino: number, cantidad: number): Promise<{
        success: boolean;
    }>;
}
