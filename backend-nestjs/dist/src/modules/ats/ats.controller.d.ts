import { Response } from 'express';
import { AtsService } from './ats.service';
import { GenerarAtsDto } from './dto/generar-ats.dto';
export declare class AtsController {
    private readonly atsService;
    constructor(atsService: AtsService);
    generarATS(dto: GenerarAtsDto, res: Response): Promise<Response<any, Record<string, any>>>;
    obtenerResumen(dto: GenerarAtsDto): Promise<{
        periodo: string;
        totalVentas: string;
        cantidadVentas: number;
        totalCompras: string;
        cantidadCompras: number;
        retenciones: number;
    }>;
}
