import { Repository, DataSource } from 'typeorm';
import { Compra } from './entities/compra.entity';
import { CompraDetalle } from './entities/compra-detalle.entity';
import { Producto } from '../productos/entities/producto.entity';
import { CreateCompraDto } from './dto/create-compra.dto';
import { InventarioService } from '../inventario/inventario.service';
import { ContabilidadService } from '../contabilidad/contabilidad.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { ImpuestosService } from '../sri/services/impuestos.service';
import { RetencionesService } from './services/retenciones.service';
export declare class ComprasService {
    private compraRepository;
    private detalleRepository;
    private productoRepository;
    private dataSource;
    private inventarioService;
    private contabilidadService;
    private eventsGateway;
    private impuestosService;
    private retencionesService;
    private readonly logger;
    constructor(compraRepository: Repository<Compra>, detalleRepository: Repository<CompraDetalle>, productoRepository: Repository<Producto>, dataSource: DataSource, inventarioService: InventarioService, contabilidadService: ContabilidadService, eventsGateway: EventsGateway, impuestosService: ImpuestosService, retencionesService: RetencionesService);
    create(createCompraDto: CreateCompraDto): Promise<Compra>;
    updateEstado(id: number, estado: string): Promise<Compra>;
    findAll(): Promise<Compra[]>;
    findOne(id: number): Promise<Compra>;
    importarXml(buffer: Buffer): Promise<{
        proveedor: {
            codigo: any;
            nombre: any;
            direccion: any;
            existente: boolean;
            id: number;
        };
        compra: {
            numero_comprobante: string;
            fecha_compra: string;
            tipo_comprobante: string;
            total: number;
            autorizacion: any;
        };
        detalles: {
            producto_id: string | number;
            codigo: any;
            cantidad: number;
            descripcion: any;
            precio_unitario: number;
            descuento: number;
            subtotal: number;
            impuesto_codigo: any;
            impuesto_porcentaje: any;
        }[];
    }>;
    private parseFechaSri;
}
