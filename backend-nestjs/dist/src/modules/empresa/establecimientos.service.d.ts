import { Repository } from 'typeorm';
import { Establecimiento } from './entities/establecimiento.entity';
export declare class EstablecimientosService {
    private repo;
    constructor(repo: Repository<Establecimiento>);
    create(data: Partial<Establecimiento>): Promise<Establecimiento>;
    findAll(): Promise<Establecimiento[]>;
    findOne(id: number): Promise<Establecimiento>;
    update(id: number, data: Partial<Establecimiento>): Promise<Establecimiento>;
    remove(id: number): Promise<Establecimiento>;
}
