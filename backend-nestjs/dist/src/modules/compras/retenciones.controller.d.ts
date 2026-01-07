import { Response } from 'express';
import { RetencionesService } from './services/retenciones.service';
export declare class RetencionesController {
    private readonly retencionesService;
    constructor(retencionesService: RetencionesService);
    findAll(desde?: string, hasta?: string, estado?: string): Promise<import("./entities/comprobante-retencion.entity").ComprobanteRetencion[]>;
    findOne(id: number): Promise<import("./entities/comprobante-retencion.entity").ComprobanteRetencion>;
    findByCompra(compraId: number): Promise<import("./entities/comprobante-retencion.entity").ComprobanteRetencion>;
    downloadPdf(id: number, res: Response): Promise<void>;
}
