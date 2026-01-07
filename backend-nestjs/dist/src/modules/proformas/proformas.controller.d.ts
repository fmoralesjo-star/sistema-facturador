import { ProformasService } from './proformas.service';
export declare class ProformasController {
    private readonly proformasService;
    constructor(proformasService: ProformasService);
    create(createProformaDto: any): Promise<import("./entities/proforma.entity").Proforma[]>;
    findAll(query: any): Promise<import("./entities/proforma.entity").Proforma[]>;
    findOne(id: string): Promise<import("./entities/proforma.entity").Proforma>;
}
