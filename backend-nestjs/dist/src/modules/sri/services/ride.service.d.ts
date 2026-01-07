import { Repository } from 'typeorm';
import { Factura } from '../../facturas/entities/factura.entity';
import { Voucher } from '../../facturas/entities/voucher.entity';
import { EmpresaService } from '../../empresa/empresa.service';
import { NotaCredito } from '../../notas-credito/entities/nota-credito.entity';
import { PostgresStorageService } from '../../common/services/postgres-storage.service';
export declare class RideService {
    private facturaRepository;
    private voucherRepository;
    private notaCreditoRepository;
    private empresaService;
    private storageService;
    private readonly logger;
    private readonly uploadsDir;
    constructor(facturaRepository: Repository<Factura>, voucherRepository: Repository<Voucher>, notaCreditoRepository: Repository<NotaCredito>, empresaService: EmpresaService, storageService: PostgresStorageService);
    generarRIDE(facturaId: number): Promise<string>;
    private agregarLogo;
    private agregarEncabezado;
    private agregarInformacionEmisor;
    private agregarInformacionCliente;
    private agregarTablaProductos;
    private agregarCuadroTotales;
    private agregarInformacionAdicional;
    private agregarCodigoBarras;
    obtenerRIDE(facturaId: number): Promise<Buffer>;
    obtenerRIDENotaCredito(ncId: number): Promise<Buffer>;
    generarRIDENotaCredito(ncId: number): Promise<string>;
}
