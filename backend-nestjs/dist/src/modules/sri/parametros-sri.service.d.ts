import { Repository } from 'typeorm';
import { ImpuestoIVA } from './entities/impuesto-iva.entity';
import { RetencionSRI } from './entities/retencion-sri.entity';
import { SustentoTributario } from './entities/sustento-tributario.entity';
export declare class ParametrosSriService {
    private ivaRepo;
    private retencionRepo;
    private sustentoRepo;
    constructor(ivaRepo: Repository<ImpuestoIVA>, retencionRepo: Repository<RetencionSRI>, sustentoRepo: Repository<SustentoTributario>);
    findAllIva(): Promise<ImpuestoIVA[]>;
    createIva(data: Partial<ImpuestoIVA>): Promise<ImpuestoIVA>;
    toggleIva(id: number): Promise<ImpuestoIVA>;
    findAllRetenciones(): Promise<RetencionSRI[]>;
    createRetencion(data: Partial<RetencionSRI>): Promise<RetencionSRI>;
    toggleRetencion(id: number): Promise<RetencionSRI>;
    findAllSustento(): Promise<SustentoTributario[]>;
    createSustento(data: Partial<SustentoTributario>): Promise<SustentoTributario>;
}
