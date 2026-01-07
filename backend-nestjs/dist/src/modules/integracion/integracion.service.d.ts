import { Repository } from 'typeorm';
import { Factura } from '../facturas/entities/factura.entity';
import { Producto } from '../productos/entities/producto.entity';
import { MovimientoInventario } from '../inventario/entities/movimiento-inventario.entity';
import { AsientoContable } from '../contabilidad/entities/asiento-contable.entity';
import { Promocion } from '../promociones/entities/promocion.entity';
import { Transferencia } from '../transferencias/entities/transferencia.entity';
import { Empleado } from '../recursos-humanos/entities/empleado.entity';
export declare class IntegracionService {
    private facturaRepository;
    private productoRepository;
    private movimientoRepository;
    private asientoRepository;
    private promocionRepository;
    private transferenciaRepository;
    private empleadoRepository;
    constructor(facturaRepository: Repository<Factura>, productoRepository: Repository<Producto>, movimientoRepository: Repository<MovimientoInventario>, asientoRepository: Repository<AsientoContable>, promocionRepository: Repository<Promocion>, transferenciaRepository: Repository<Transferencia>, empleadoRepository: Repository<Empleado>);
    obtenerEstadisticasConsolidadas(): Promise<{
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
    obtenerProductoIntegrado(productoId: number): Promise<{
        producto: Producto;
        movimientos: MovimientoInventario[];
        facturas: Factura[];
        promociones: Promocion[];
    }>;
    obtenerFacturaIntegrada(facturaId: number): Promise<{
        factura: Factura;
        movimientos: MovimientoInventario[];
        asientoContable: AsientoContable;
    }>;
}
