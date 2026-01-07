import { Repository } from 'typeorm';
import { Banco } from './entities/banco.entity';
import { CreateBancoDto } from './dto/create-banco.dto';
export declare class BancosService {
    private bancoRepository;
    constructor(bancoRepository: Repository<Banco>);
    create(createBancoDto: CreateBancoDto): Promise<Banco>;
    findAll(): Promise<Banco[]>;
    findOne(id: number): Promise<Banco>;
    update(id: number, updateData: Partial<CreateBancoDto>): Promise<Banco>;
    remove(id: number): Promise<void>;
    actualizarSaldo(bancoId: number, monto: number, tipo: 'suma' | 'resta'): Promise<void>;
}
