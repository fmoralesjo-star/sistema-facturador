import { Response } from 'express';
import { SriService } from './sri.service';
import { FirmaElectronicaService } from './services/firma-electronica.service';
import { RideService } from './services/ride.service';
import { UploadCertificadoDto } from './dto/upload-certificado.dto';
export declare class SriController {
    private readonly sriService;
    private readonly firmaElectronicaService;
    private readonly rideService;
    constructor(sriService: SriService, firmaElectronicaService: FirmaElectronicaService, rideService: RideService);
    uploadCertificado(file: Express.Multer.File, uploadDto: UploadCertificadoDto): Promise<{
        success: boolean;
        message: string;
        certificado: {
            ruc: string;
            razonSocial: string;
            numeroSerie: string;
            fechaEmision: Date;
            fechaVencimiento: Date;
            vigente: boolean;
        };
    }>;
    generarRIDE(facturaId: number, res: Response): Promise<void>;
    regenerarRIDE(facturaId: number, res: Response): Promise<void>;
    obtenerInfoCertificado(): Promise<{
        success: boolean;
        certificado: {
            ruc: string;
            razonSocial: string;
            numeroSerie: string;
            fechaEmision: Date;
            fechaVencimiento: Date;
            vigente: boolean;
            archivo: string;
        };
    }>;
    consultarRecibidos(fechaInicio: string, fechaFin: string): Promise<any[]>;
    consultarConteoPendientes(): Promise<{
        pendientes: number;
    }>;
}
