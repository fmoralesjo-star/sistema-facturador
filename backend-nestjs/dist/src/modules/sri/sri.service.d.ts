import { ConfigService } from '@nestjs/config';
import { Factura } from '../facturas/entities/factura.entity';
import { NotaCredito } from '../notas-credito/entities/nota-credito.entity';
import { XmlGeneratorService } from './services/xml-generator.service';
import { FirmaElectronicaService } from './services/firma-electronica.service';
import { SriWsService } from './services/sri-ws.service';
import { XsdValidationService } from './services/xsd-validation.service';
export interface SriJobData {
    facturaId: number;
    xmlContent: string;
    ambiente: 'pruebas' | 'produccion';
    claveAcceso: string;
}
import { PostgresQueueService } from '../common/services/postgres-queue.service';
export declare class SriService {
    private sriQueue;
    private configService;
    private xmlGeneratorService;
    private firmaElectronicaService;
    private sriWsService;
    private xsdValidationService;
    constructor(sriQueue: PostgresQueueService, configService: ConfigService, xmlGeneratorService: XmlGeneratorService, firmaElectronicaService: FirmaElectronicaService, sriWsService: SriWsService, xsdValidationService: XsdValidationService);
    enviarFacturaAlSri(data: SriJobData): Promise<{
        jobId: string;
        message: string;
    }>;
    consultarEstadoTarea(jobId: string): Promise<{
        msg: string;
        error?: undefined;
    } | {
        error: string;
        msg?: undefined;
    }>;
    generarXMLFactura(factura: Factura): Promise<string>;
    generarXMLNotaCredito(notaCredito: NotaCredito): Promise<string>;
    generarClaveAcceso(factura: any): string;
    firmarXML(xmlContent: string, ruc: string): Promise<string>;
    enviarAlSri(xmlContent: string, ambiente: string): Promise<any>;
    consultarAutorizacion(claveAcceso: string, ambiente: string): Promise<any>;
    enviarYAutorizar(xmlContent: string, claveAcceso: string, ambiente: string): Promise<any>;
    consultarComprobantesRecibidos(fechaInicio: string, fechaFin: string): Promise<any[]>;
    consultarConteoPendientes(): Promise<{
        pendientes: number;
    }>;
    private generarComprobantesMock;
    private generarClaveAccesoMock;
}
