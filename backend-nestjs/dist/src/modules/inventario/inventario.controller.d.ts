import { InventarioService } from './inventario.service';
export declare class InventarioController {
    private readonly inventarioService;
    constructor(inventarioService: InventarioService);
    getInventario(): Promise<{
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
    getMovimientos(): Promise<{
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
    getEstadisticas(): Promise<{
        total_productos: number;
        stock_total: number;
        productos_stock_bajo: number;
        productos_sin_stock: number;
        valor_total: number;
        ventas_hoy: number;
        costo_ventas_hoy: number;
    }>;
    getStockBajo(limite?: string): Promise<{
        id: number;
        codigo: string;
        sku: string;
        nombre: string;
        stock: number;
        precio: number;
    }[]>;
    getKardex(productoId: number, puntoVentaId?: string): Promise<{
        producto: import("../productos/entities/producto.entity").Producto;
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
            producto: import("../productos/entities/producto.entity").Producto;
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
    getAlertas(): Promise<import("./alertas-inventario.service").AlertaInventario[]>;
    getResumenAlertas(): Promise<{
        total: number;
        criticas: number;
        altas: number;
        medias: number;
        bajas: number;
        alertas: import("./alertas-inventario.service").AlertaInventario[];
    }>;
    getProductosReorden(): Promise<{
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
    getValoracion(): Promise<{
        valoracion_total: number;
        productos: any[];
    }>;
    createMovimiento(dto: any): Promise<import("./entities/movimiento-inventario.entity").MovimientoInventario>;
    getInventarioPorPuntoVenta(puntoVentaId: number): Promise<{
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
        movimientos: import("./entities/movimiento-inventario.entity").MovimientoInventario[];
        created_at: Date;
        updated_at: Date;
        deleted_at: Date;
    }[]>;
    transferirStock(dto: {
        producto_id: number;
        punto_venta_origen: number;
        punto_venta_destino: number;
        cantidad: number;
    }): Promise<{
        success: boolean;
    }>;
    ajusteMasivo(dto: {
        ajustes: any[];
        punto_venta_id: number;
        fecha?: string;
        motivo?: string;
    }): Promise<{
        procesados: number;
        detalles: any[];
    }>;
    transferenciaMasiva(dto: {
        transferencias: Array<{
            producto_id: number;
            cantidad: number;
        }>;
        punto_venta_origen: number;
        punto_venta_destino: number;
        motivo?: string;
        fecha?: string;
    }): Promise<{
        procesados: number;
        fallidos: number;
        detalles: any[];
    }>;
}
