import { Repository } from 'typeorm';
import { Proforma } from './entities/proforma.entity';
import { ProformaDetalle } from './entities/proforma-detalle.entity';
export declare class ProformasService {
    private proformasRepository;
    private detallesRepository;
    constructor(proformasRepository: Repository<Proforma>, detallesRepository: Repository<ProformaDetalle>);
    create(createProformaDto: any): Promise<Proforma[]>;
    findAll(query: any): Promise<Proforma[]>;
    findOne(id: number): Promise<Proforma>;
}
