import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
export declare class ComprasController {
    private readonly comprasService;
    constructor(comprasService: ComprasService);
    findAll(): Promise<import("./entities/compra.entity").Compra[]>;
    create(createDto: CreateCompraDto): Promise<import("./entities/compra.entity").Compra>;
    findOne(id: number): Promise<import("./entities/compra.entity").Compra>;
    importarXml(file: Express.Multer.File): Promise<{
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
    updateEstado(id: number, estado: string): Promise<import("./entities/compra.entity").Compra>;
}
