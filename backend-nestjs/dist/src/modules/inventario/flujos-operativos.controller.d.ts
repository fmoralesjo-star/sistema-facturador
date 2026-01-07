import { FlujosOperativosService } from './flujos-operativos.service';
export declare class FlujosOperativosController {
    private readonly flujosService;
    constructor(flujosService: FlujosOperativosService);
    crearOrdenCompra(data: any): Promise<import("./entities/orden-compra.entity").OrdenCompra>;
    obtenerOrdenesCompra(): Promise<import("./entities/orden-compra.entity").OrdenCompra[]>;
    crearAlbaran(data: any): Promise<import("./entities/albaran.entity").Albaran>;
    obtenerAlbaranes(): Promise<import("./entities/albaran.entity").Albaran[]>;
    crearTransferencia(data: any): Promise<import("./entities/transferencia.entity").Transferencia>;
    obtenerTransferencias(): Promise<import("./entities/transferencia.entity").Transferencia[]>;
    registrarAjuste(data: any): Promise<import("./entities/ajuste-inventario.entity").AjusteInventario>;
    obtenerAjustes(): Promise<import("./entities/ajuste-inventario.entity").AjusteInventario[]>;
    crearPicking(data: any): Promise<import("./entities/picking.entity").Picking>;
    obtenerPickings(): Promise<import("./entities/picking.entity").Picking[]>;
    crearConteoCiclico(data: any): Promise<import("./entities/conteo-ciclico.entity").ConteoCiclico>;
    obtenerConteosCiclicos(): Promise<import("./entities/conteo-ciclico.entity").ConteoCiclico[]>;
}
