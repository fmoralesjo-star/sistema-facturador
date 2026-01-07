import { ParametrosSriService } from './parametros-sri.service';
export declare class ParametrosSriController {
    private readonly service;
    constructor(service: ParametrosSriService);
    findAllIva(): Promise<import("./entities/impuesto-iva.entity").ImpuestoIVA[]>;
    createIva(data: any): Promise<import("./entities/impuesto-iva.entity").ImpuestoIVA>;
    toggleIva(id: number): Promise<import("./entities/impuesto-iva.entity").ImpuestoIVA>;
    findAllRetenciones(): Promise<import("./entities/retencion-sri.entity").RetencionSRI[]>;
    createRetencion(data: any): Promise<import("./entities/retencion-sri.entity").RetencionSRI>;
    toggleRetencion(id: number): Promise<import("./entities/retencion-sri.entity").RetencionSRI>;
    findAllSustento(): Promise<import("./entities/sustento-tributario.entity").SustentoTributario[]>;
    createSustento(data: any): Promise<import("./entities/sustento-tributario.entity").SustentoTributario>;
}
