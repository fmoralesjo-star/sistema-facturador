import { Response } from 'express';
import { NotasCreditoService } from './notas-credito.service';
import { RideService } from '../sri/services/ride.service';
export declare class NotasCreditoController {
    private readonly notasCreditoService;
    private readonly rideService;
    constructor(notasCreditoService: NotasCreditoService, rideService: RideService);
    create(createDto: any): Promise<import("./entities").NotaCredito>;
    findAll(): Promise<import("./entities").NotaCredito[]>;
    findOne(id: string): Promise<import("./entities").NotaCredito>;
    getPdf(id: string, res: Response): Promise<void>;
}
