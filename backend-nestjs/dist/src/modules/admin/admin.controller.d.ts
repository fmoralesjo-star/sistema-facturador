import { AdminService } from './admin.service';
import { ContingenciaService } from './contingencia.service';
import { EmailService } from './email.service';
export declare class AdminController {
    private readonly adminService;
    private readonly contingenciaService;
    private readonly emailService;
    constructor(adminService: AdminService, contingenciaService: ContingenciaService, emailService: EmailService);
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
    getConfiguracion(): Promise<import("./entities/configuracion.entity").Configuracion[] | ({
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
    })[]>;
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
    getBackups(): Promise<import("./entities/backup-log.entity").BackupLog[] | {
        success: boolean;
        message: string;
    }>;
    createBackup(): Promise<{
        success: boolean;
        message: string;
        archivo?: undefined;
    } | {
        success: boolean;
        message: string;
        archivo: string;
    }>;
    restaurarBackup(body: {
        archivo: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    limpiarDatos(body: {
        tipo: string;
        dias: number;
    }): Promise<{
        success: boolean;
        registros_eliminados: number;
        message: string;
    }>;
    getReportes(tipo: string, fechaInicio: string, fechaFin: string): Promise<{
        fecha: any;
        cantidad: number;
        total: number;
    }[]>;
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
    } | {
        success: boolean;
        message: string;
    }>;
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
    getSRIStatus(): Promise<{
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
    } | {
        overall: string;
        error: any;
    }>;
    getDocumentosPendientes(tipo?: string, estado?: string): Promise<import("./entities/documento-pendiente-sri.entity").DocumentoPendienteSRI[] | {
        error: any;
    }>;
    getContadorDocumentosRepresados(): Promise<{
        total: number;
        facturas: number;
        notasCredito: number;
        anulaciones: number;
        retenciones: number;
    }>;
    reintentarEnvio(id: string): Promise<{
        exito: boolean;
        mensaje: any;
    }>;
    procesarColaContingencia(): Promise<{
        procesados: number;
        exitosos: number;
        fallidos: number;
        errores: any[];
    }>;
    testSmtpConnection(config: any): Promise<{
        success: boolean;
        message: any;
    }>;
    getEmails(limit: number): Promise<import("./entities/email-log.entity").EmailLog[]>;
    retryEmail(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
