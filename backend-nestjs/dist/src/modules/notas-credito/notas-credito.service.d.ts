import { Repository, DataSource } from 'typeorm';
import { NotaCredito, NotaCreditoDetalle } from './entities/nota-credito.entity';
import { FacturasService } from '../facturas/facturas.service';
import { InventarioService } from '../inventario/inventario.service';
import { ContabilidadService } from '../contabilidad/contabilidad.service';
import { SriService } from '../sri/sri.service';
import { Configuracion } from '../admin/entities/configuracion.entity';
export declare class NotasCreditoService {
    private notaCreditoRepository;
    private detalleRepository;
    private configuracionRepository;
    private facturasService;
    private inventarioService;
    private contabilidadService;
    private sriService;
    private dataSource;
    constructor(notaCreditoRepository: Repository<NotaCredito>, detalleRepository: Repository<NotaCreditoDetalle>, configuracionRepository: Repository<Configuracion>, facturasService: FacturasService, inventarioService: InventarioService, contabilidadService: ContabilidadService, sriService: SriService, dataSource: DataSource);
    create(createDto: {
        factura_id: number;
        motivo: string;
        detalles?: {
            producto_id: number;
            cantidad: number;
        }[];
    }): Promise<NotaCredito>;
    private procesarSRIEnFondo;
    findAll(): Promise<NotaCredito[]>;
    findOne(id: number): Promise<NotaCredito>;
}
