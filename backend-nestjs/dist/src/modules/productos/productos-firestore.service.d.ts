import { FirestoreService } from '../firebase/firestore.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { CreateProductoDto, UpdateProductoDto } from './productos.service';
export declare class ProductosFirestoreService {
    private firestoreService;
    private eventsGateway;
    private readonly collectionName;
    constructor(firestoreService: FirestoreService, eventsGateway: EventsGateway);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findByCodigo(codigo: string): Promise<any>;
    create(createDto: CreateProductoDto): Promise<{
        stock: number;
        fecha_movimiento: Date;
        tipo_impuesto: string;
        activo: boolean;
        num_movimiento?: string;
        codigo: string;
        grupo_comercial?: string;
        referencia?: string;
        sku?: string;
        nombre: string;
        descripcion?: string;
        coleccion?: string;
        categoria?: string;
        talla?: string;
        color?: string;
        desc_color?: string;
        cod_barras?: string;
        precio_costo?: number;
        precio: number;
        unidad?: string;
        punto_reorden?: number;
        stock_seguridad?: number;
        tiempo_entrega_dias?: number;
        id: string;
    }>;
    update(id: string, updateDto: UpdateProductoDto): Promise<any>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    crearProductoEjemplo(): Promise<{
        success: boolean;
        message: string;
        producto: any;
    }>;
}
