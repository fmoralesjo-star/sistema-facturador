import { Repository } from 'typeorm';
import { Factura } from '../facturas/entities/factura.entity';
import { Compra } from '../compras/entities/compra.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { GenerarAtsDto } from './dto/generar-ats.dto';
export declare class AtsService {
    private readonly facturaRepository;
    private readonly compraRepository;
    private readonly empresaRepository;
    constructor(facturaRepository: Repository<Factura>, compraRepository: Repository<Compra>, empresaRepository: Repository<Empresa>);
    generarATS(dto: GenerarAtsDto): Promise<string>;
    private construirCompras;
    private construirVentas;
    private construirVentasEstablecimiento;
    private calcularTotalVentas;
    private formatearFecha;
    obtenerResumenPeriodo(dto: GenerarAtsDto): Promise<{
        periodo: string;
        totalVentas: string;
        cantidadVentas: number;
        totalCompras: string;
        cantidadCompras: number;
        retenciones: number;
    }>;
}
