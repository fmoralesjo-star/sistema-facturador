import { ConfigService } from '@nestjs/config';
import { XadesBesService } from './xades-bes.service';
export interface CertificadoInfo {
    ruc: string;
    razonSocial: string;
    numeroSerie: string;
    fechaEmision: Date;
    fechaVencimiento: Date;
    certificado: any;
    clavePrivada: any;
}
export declare class FirmaElectronicaService {
    private configService;
    private xadesBesService;
    private readonly logger;
    private readonly vaultKey;
    private readonly certPath;
    constructor(configService: ConfigService, xadesBesService: XadesBesService);
    cargarCertificadoP12(p12Path: string, password: string, rucProvided?: string): Promise<CertificadoInfo>;
    encriptarBuffer(buffer: Buffer): Promise<Buffer>;
    desencriptarBuffer(encryptedBuffer: Buffer): Promise<Buffer>;
    guardarArchivoEncriptado(filePath: string, buffer: Buffer): Promise<void>;
    private extraerRUC;
    verificarVigenciaCertificado(info: CertificadoInfo): boolean;
    firmarXML(xmlContent: string, certificadoInfo: CertificadoInfo): Promise<string>;
    encriptarPassword(password: string): Promise<string>;
    desencriptarPassword(encryptedPassword: string): Promise<string>;
    private getDerivedKey;
    guardarPasswordEncriptada(ruc: string, passwordEncriptada: string): Promise<void>;
    obtenerPasswordEncriptada(ruc: string): Promise<string | null>;
}
