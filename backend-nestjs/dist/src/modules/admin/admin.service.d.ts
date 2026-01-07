import { Repository } from 'typeorm';
import { Factura } from '../facturas/entities/factura.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { BackupLog } from './entities/backup-log.entity';
import { Configuracion } from './entities/configuracion.entity';
import { AuditService } from '../audit/audit.service';
export declare class AdminService {
    private facturaRepository?;
    private productoRepository?;
    private clienteRepository?;
    private backupLogRepository?;
    private configuracionRepository?;
    private readonly auditService?;
    constructor(facturaRepository?: Repository<Factura>, productoRepository?: Repository<Producto>, clienteRepository?: Repository<Cliente>, backupLogRepository?: Repository<BackupLog>, configuracionRepository?: Repository<Configuracion>, auditService?: AuditService);
    getEstadisticas(): Promise<{
        facturas: number;
        productos: number;
        clientes: number;
        compras: number;
        proveedores: number;
        ventas_mes: number;
        compras_mes: number;
        utilidad_mes: number;
        stock_total: number;
        productos_stock_bajo: number;
    }>;
    getActividad(): Promise<{
        tipo: string;
        referencia: string;
        fecha_actividad: Date;
        monto: number;
        descripcion: string;
    }[]>;
    getConfiguracion(): Promise<({
        clave: string;
        valor: string;
        descripcion: string;
        tipo: string;
        grupo: string;
        kind?: undefined;
    } | {
        clave: string;
        valor: string;
        descripcion: string;
        kind: string;
        tipo?: undefined;
        grupo?: undefined;
    })[] | Configuracion[]>;
    getDefaultConfig(): ({
        clave: string;
        valor: string;
        descripcion: string;
        tipo: string;
        grupo: string;
        kind?: undefined;
    } | {
        clave: string;
        valor: string;
        descripcion: string;
        kind: string;
        tipo?: undefined;
        grupo?: undefined;
    })[];
    updateConfiguracion(configuracion: any): Promise<{
        success: boolean;
        message: string;
    }>;
    validateConfiguration(): Promise<{
        firma: {
            status: string;
            message: string;
        };
        secuenciales: {
            status: string;
            message: string;
        };
        impuestos: {
            status: string;
            message: string;
        };
        correo: {
            status: string;
            message: string;
        };
    }>;
    restaurarBackup(archivo: string): Promise<{
        success: boolean;
        message: string;
    }>;
    limpiarDatos(tipo: string, dias: number): Promise<{
        success: boolean;
        registros_eliminados: number;
        message: string;
    }>;
    getReportes(tipo: string, fechaInicio: string, fechaFin: string): Promise<{
        fecha: any;
        cantidad: number;
        total: number;
    }[]>;
    private getComprasCount;
    private getProveedoresCount;
    private getStockTotal;
    private getProductosStockBajo;
    private getComprasMes;
    getSystemHealth(): Promise<{
        status: string;
        latency: number;
        connections: any;
        storage_size: any;
        timestamp: string;
        error?: undefined;
    } | {
        status: string;
        latency: number;
        connections: number;
        storage_size: number;
        error: any;
        timestamp: string;
    }>;
    handleCron(): Promise<void>;
    generateBackup(): Promise<{
        success: boolean;
        message: string;
        archivo?: undefined;
    } | {
        success: boolean;
        message: string;
        archivo: string;
    }>;
    getBackups(): Promise<BackupLog[]>;
    createBackup(): Promise<{
        success: boolean;
        message: string;
        archivo?: undefined;
    } | {
        success: boolean;
        message: string;
        archivo: string;
    }>;
    private ensureTableExists;
    getSystemResources(): Promise<{
        cpu: number;
        memory: {
            total: number;
            free: number;
            used: number;
            usagePercentage: number;
        };
        uptime: number;
        platform: string;
        error?: undefined;
    } | {
        cpu: number;
        memory: {
            total: number;
            free: number;
            used: number;
            usagePercentage: number;
        };
        error: any;
        uptime?: undefined;
        platform?: undefined;
    }>;
    private getHbCpuUsage;
    private cpuAverage;
    clearMemory(): Promise<{
        success: boolean;
        message: string;
        before: {
            heapUsed: string;
            rss: string;
        };
        after: {
            heapUsed: string;
            rss: string;
        };
    } | {
        success: boolean;
        message: string;
        before?: undefined;
        after?: undefined;
    }>;
    checkSRIStatus(): Promise<{
        ambiente: string;
        timestamp: string;
        recepcion: {
            status: string;
            latency: number;
            error: any;
        };
        autorizacion: {
            status: string;
            latency: number;
            error: any;
        };
        overall: string;
    }>;
    testSmtpConnection(config: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
