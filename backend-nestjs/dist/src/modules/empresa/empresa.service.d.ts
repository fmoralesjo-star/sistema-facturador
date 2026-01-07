import { Repository } from 'typeorm';
import { Empresa } from './entities/empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
export declare class EmpresaService {
    private empresaRepository;
    constructor(empresaRepository: Repository<Empresa>);
    create(createEmpresaDto: CreateEmpresaDto): Promise<Empresa>;
    findAll(): Promise<Empresa[]>;
    findActive(): Promise<Empresa | null>;
    findOne(id: number): Promise<Empresa>;
    findByRuc(ruc: string): Promise<Empresa | null>;
    update(id: number, updateEmpresaDto: UpdateEmpresaDto): Promise<Empresa>;
    remove(id: number): Promise<void>;
    activate(id: number): Promise<Empresa>;
    deactivate(id: number): Promise<Empresa>;
}
