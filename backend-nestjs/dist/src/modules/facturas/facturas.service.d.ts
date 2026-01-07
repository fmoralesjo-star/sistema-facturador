import { Repository, DataSource } from 'typeorm';
import { Factura } from './entities/factura.entity';
import { FacturaDetalle } from './entities/factura-detalle.entity';
import { Producto } from '../productos/entities/producto.entity';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { SriService } from '../sri/sri.service';
import { InventarioService } from '../inventario/inventario.service';
import { ContabilidadService } from '../contabilidad/contabilidad.service';
import { EmpresaService } from '../empresa/empresa.service';
import { EventsGateway } from '../../gateways/events.gateway';
export declare class FacturasService {
    private facturaRepository;
    private detalleRepository;
    private productoRepository;
    private dataSource;
    private sriService;
    private inventarioService;
    private contabilidadService;
    private empresaService;
    private eventsGateway;
    constructor(facturaRepository: Repository<Factura>, detalleRepository: Repository<FacturaDetalle>, productoRepository: Repository<Producto>, dataSource: DataSource, sriService: SriService, inventarioService: InventarioService, contabilidadService: ContabilidadService, empresaService: EmpresaService, eventsGateway: EventsGateway);
    create(createFacturaDto: CreateFacturaDto): Promise<Factura>;
    findAll(): Promise<Factura[]>;
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
        clienteId?: number;
        estadoSri?: string;
    }): Promise<Factura[]>;
    findOne(id: number): Promise<Factura>;
    validarStock(detalles: CreateFacturaDto['detalles']): Promise<void>;
    updateEstado(id: number, estado: string): Promise<Factura>;
    anular(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
