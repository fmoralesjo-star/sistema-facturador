import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ComprobanteRetencion } from '../entities/comprobante-retencion.entity';
import { Compra } from '../entities/compra.entity';
import { SriService } from '../../sri/sri.service';
export declare class RetencionesService {
    private retencionRepository;
    private dataSource;
    private configService;
    private sriService;
    private readonly logger;
    private readonly ambiente;
    private readonly uploadsDir;
    constructor(retencionRepository: Repository<ComprobanteRetencion>, dataSource: DataSource, configService: ConfigService, sriService: SriService);
    emitirRetencion(compra: Compra): Promise<ComprobanteRetencion>;
    private generarXMLRetencion;
    private generarPDFRetencion;
    private generarClaveAcceso;
    private calcularDigitoVerificador;
    private obtenerSiguienteSecuencial;
    private formatearFecha;
    private obtenerPeriodoFiscal;
    private escapeXML;
    findOne(id: number): Promise<ComprobanteRetencion>;
    findByCompra(compraId: number): Promise<ComprobanteRetencion>;
    findAll(filtros?: {
        desde?: Date;
        hasta?: Date;
        estado?: string;
    }): Promise<ComprobanteRetencion[]>;
}
