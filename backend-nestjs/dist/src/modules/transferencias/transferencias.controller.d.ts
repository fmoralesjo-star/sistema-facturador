import { TransferenciasService } from './transferencias.service';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';
export declare class TransferenciasController {
    private readonly transferenciasService;
    constructor(transferenciasService: TransferenciasService);
    create(createTransferenciaDto: CreateTransferenciaDto): Promise<import("./entities/transferencia.entity").Transferencia>;
    findAll(): Promise<import("./entities/transferencia.entity").Transferencia[]>;
    findOne(id: number): Promise<import("./entities/transferencia.entity").Transferencia>;
}
