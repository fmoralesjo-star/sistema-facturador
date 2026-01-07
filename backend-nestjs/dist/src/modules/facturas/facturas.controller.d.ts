import { FacturasService } from './facturas.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
export declare class FacturasController {
    private readonly facturasService;
    constructor(facturasService: FacturasService);
    create(createFacturaDto: CreateFacturaDto): Promise<import("./entities/factura.entity").Factura>;
    findAll(): Promise<import("./entities/factura.entity").Factura[]>;
    obtenerEstadisticas(): Promise<{
        total_facturado_mes: number;
        iva_por_pagar: number;
        comprobantes_rechazados: number;
        comprobantes_autorizados: number;
        comprobantes_pendientes: number;
        total_facturas: number;
    }>;
    buscarFacturas(filtros: {
        fechaInicio?: string;
        fechaFin?: string;
        clienteId?: string;
        estadoSri?: string;
    }): Promise<import("./entities/factura.entity").Factura[]>;
    findOne(id: number): Promise<import("./entities/factura.entity").Factura>;
    updateEstado(id: number, estado: string): Promise<import("./entities/factura.entity").Factura>;
    anular(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
