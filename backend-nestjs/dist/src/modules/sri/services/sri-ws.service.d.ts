import { ConfigService } from '@nestjs/config';
export interface RecepcionResponse {
    estado: string;
    comprobantes?: Array<{
        claveAcceso: string;
        mensajes?: Array<{
            identificador: string;
            mensaje: string;
            informacionAdicional?: string;
            tipo: string;
        }>;
    }>;
}
export interface AutorizacionResponse {
    autorizaciones?: Array<{
        estado: string;
        numeroAutorizacion?: string;
        fechaAutorizacion?: string;
        ambiente?: string;
        comprobante?: string;
        mensajes?: Array<{
            identificador: string;
            mensaje: string;
            informacionAdicional?: string;
            tipo: string;
        }>;
    }>;
}
export declare class SriWsService {
    private configService;
    private readonly logger;
    private readonly WS_RECEPCION_PRUEBAS;
    private readonly WS_AUTORIZACION_PRUEBAS;
    private readonly WS_RECEPCION_PRODUCCION;
    private readonly WS_AUTORIZACION_PRODUCCION;
    constructor(configService: ConfigService);
    private getRecepcionUrl;
    private getAutorizacionUrl;
    enviarRecepcion(xmlFirmado: string, ambiente: string): Promise<RecepcionResponse>;
    consultarAutorizacion(claveAcceso: string, ambiente: string): Promise<AutorizacionResponse>;
    enviarYAutorizar(xmlFirmado: string, claveAcceso: string, ambiente: string): Promise<{
        recepcion: RecepcionResponse;
        autorizacion?: AutorizacionResponse;
    }>;
}
