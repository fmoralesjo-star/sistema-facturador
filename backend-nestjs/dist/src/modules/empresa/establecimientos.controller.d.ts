import { EstablecimientosService } from './establecimientos.service';
export declare class EstablecimientosController {
    private readonly service;
    constructor(service: EstablecimientosService);
    create(data: any): Promise<import("./entities/establecimiento.entity").Establecimiento>;
    findAll(): Promise<import("./entities/establecimiento.entity").Establecimiento[]>;
    findOne(id: number): Promise<import("./entities/establecimiento.entity").Establecimiento>;
    update(id: number, data: any): Promise<import("./entities/establecimiento.entity").Establecimiento>;
    remove(id: number): Promise<import("./entities/establecimiento.entity").Establecimiento>;
}
