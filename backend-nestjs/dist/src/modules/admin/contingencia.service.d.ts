import { Repository } from 'typeorm';
import { DocumentoPendienteSRI } from './entities/documento-pendiente-sri.entity';
export declare class ContingenciaService {
    private documentosPendientesRepo;
    private readonly logger;
    private readonly MAX_REINTENTOS;
    private readonly TIMEOUT_SRI;
    constructor(documentosPendientesRepo: Repository<DocumentoPendienteSRI>);
    agregarAColaContingencia(tipoDocumento: 'FACTURA' | 'NOTA_CREDITO' | 'ANULACION' | 'RETENCION', documentoId: number, numeroDocumento: string, clienteNombre: string, xmlContenido: string, claveAcceso: string): Promise<DocumentoPendienteSRI>;
    obtenerDocumentosPendientes(filtros?: {
        tipo?: string;
        estado?: string;
        limite?: number;
    }): Promise<DocumentoPendienteSRI[]>;
    obtenerContadorDocumentosRepresados(): Promise<{
        total: number;
        facturas: number;
        notasCredito: number;
        anulaciones: number;
        retenciones: number;
    }>;
    verificarEstadoSRI(): Promise<boolean>;
    procesarColaContingencia(): Promise<{
        procesados: number;
        exitosos: number;
        fallidos: number;
        errores: string[];
    }>;
    private enviarDocumentoAlSRI;
    private extraerNumeroAutorizacion;
    reintentarEnvioDocumento(id: number): Promise<{
        exito: boolean;
        mensaje: string;
    }>;
}
