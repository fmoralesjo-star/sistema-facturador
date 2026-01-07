export interface CertificadoInfo {
    ruc: string;
    razonSocial: string;
    numeroSerie: string;
    fechaEmision: Date;
    fechaVencimiento: Date;
    certificado: any;
    clavePrivada: any;
}
export declare class XadesBesService {
    private readonly logger;
    firmarXML(xmlContent: string, certificadoInfo: CertificadoInfo): Promise<string>;
    private crearElementoSignature;
    private crearSignedInfo;
    private crearReference;
    private crearKeyInfo;
    private crearObjectWithSignedProperties;
    private crearSigningCertificate;
    private obtenerDNString;
    private calcularDigest;
    private calcularDigestSignedProperties;
    private canonicalizarXML;
    private firmarSignedInfo;
    private obtenerSignedPropertiesElement;
}
