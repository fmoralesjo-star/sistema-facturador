import { EmpresaService } from './empresa.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
export declare class EmpresaController {
    private readonly empresaService;
    constructor(empresaService: EmpresaService);
    create(createEmpresaDto: CreateEmpresaDto): Promise<import("./entities/empresa.entity").Empresa>;
    findAll(): Promise<import("./entities/empresa.entity").Empresa[]>;
    findActive(): Promise<import("./entities/empresa.entity").Empresa>;
    findOne(id: number): Promise<import("./entities/empresa.entity").Empresa>;
    update(id: number, updateEmpresaDto: UpdateEmpresaDto): Promise<import("./entities/empresa.entity").Empresa>;
    remove(id: number): Promise<void>;
    activate(id: number): Promise<import("./entities/empresa.entity").Empresa>;
    deactivate(id: number): Promise<import("./entities/empresa.entity").Empresa>;
    uploadLogo(ruc: string, file: Express.Multer.File): {
        success: boolean;
        message: string;
        filename: string;
    };
}
