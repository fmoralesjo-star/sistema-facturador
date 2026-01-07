import { ConfigService } from '@nestjs/config';
import { Factura } from '../../facturas/entities/factura.entity';
import { NotaCredito } from '../../notas-credito/entities/nota-credito.entity';
export declare class XmlGeneratorService {
    private configService;
    private readonly logger;
    private readonly ambiente;
    constructor(configService: ConfigService);
    generarXMLFactura(factura: Factura): Promise<string>;
    generarXMLNotaCredito(notaCredito: NotaCredito): Promise<string>;
    generarClaveAcceso(comprobante: any): string;
    private calcularDigitoVerificador;
    private construirXMLFactura;
    private construirXMLNotaCredito;
    private generarDetallesNCXML;
    private generarDetallesXML;
    private escapeXML;
    validarXML(xml: string): boolean;
}
