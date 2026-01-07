import { ContabilidadService } from './contabilidad.service';
import { CreateAsientoDto } from './dto/create-asiento.dto';
export declare class ContabilidadController {
    private readonly contabilidadService;
    constructor(contabilidadService: ContabilidadService);
    createAsiento(createDto: CreateAsientoDto): Promise<import("./entities/asiento-contable.entity").AsientoContable>;
    getAsientos(): Promise<import("./entities/asiento-contable.entity").AsientoContable[]>;
    getAsiento(id: string): Promise<import("./entities/asiento-contable.entity").AsientoContable>;
    generarEjemplos(): Promise<any>;
    getBalance(): Promise<any>;
    getResumen(fechaInicio?: string, fechaFin?: string): Promise<any>;
}
