import { Repository } from 'typeorm';
import { Transferencia } from './entities/transferencia.entity';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';
import { Producto } from '../productos/entities/producto.entity';
import { InventarioService } from '../inventario/inventario.service';
import { ContabilidadService } from '../contabilidad/contabilidad.service';
export declare class TransferenciasService {
    private transferenciaRepository;
    private productoRepository;
    private inventarioService;
    private contabilidadService;
    constructor(transferenciaRepository: Repository<Transferencia>, productoRepository: Repository<Producto>, inventarioService: InventarioService, contabilidadService: ContabilidadService);
    create(createDto: CreateTransferenciaDto): Promise<Transferencia>;
    findAll(): Promise<Transferencia[]>;
    findOne(id: number): Promise<Transferencia>;
}
