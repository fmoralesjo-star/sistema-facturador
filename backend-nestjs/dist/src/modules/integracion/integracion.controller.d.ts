import { IntegracionService } from './integracion.service';
export declare class IntegracionController {
    private readonly integracionService;
    constructor(integracionService: IntegracionService);
    obtenerEstadisticas(): Promise<{
        facturacion: {
            facturas_hoy: number;
            total_ventas_hoy: number;
        };
        inventario: {
            productos_total: number;
            productos_bajo_stock: number;
            movimientos_hoy: number;
        };
        promociones: {
            activas: number;
        };
        transferencias: {
            hoy: number;
        };
        recursos_humanos: {
            empleados_activos: number;
        };
    }>;
    obtenerProductoIntegrado(id: number): Promise<{
        producto: import("../productos/entities/producto.entity").Producto;
        movimientos: import("../inventario/entities/movimiento-inventario.entity").MovimientoInventario[];
        facturas: import("../facturas/entities/factura.entity").Factura[];
        promociones: import("../promociones/entities/promocion.entity").Promocion[];
    }>;
    obtenerFacturaIntegrada(id: number): Promise<{
        factura: import("../facturas/entities/factura.entity").Factura;
        movimientos: import("../inventario/entities/movimiento-inventario.entity").MovimientoInventario[];
        asientoContable: import("../contabilidad/entities/asiento-contable.entity").AsientoContable;
    }>;
}
