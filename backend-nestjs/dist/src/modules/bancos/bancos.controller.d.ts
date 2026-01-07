import { BancosService } from './bancos.service';
import { CreateBancoDto } from './dto/create-banco.dto';
export declare class BancosController {
    private readonly bancosService;
    constructor(bancosService: BancosService);
    create(createBancoDto: CreateBancoDto): Promise<import("./entities/banco.entity").Banco>;
    findAll(): Promise<import("./entities/banco.entity").Banco[]>;
    findOne(id: string): Promise<import("./entities/banco.entity").Banco>;
    update(id: string, updateData: Partial<CreateBancoDto>): Promise<import("./entities/banco.entity").Banco>;
    remove(id: string): Promise<void>;
}
