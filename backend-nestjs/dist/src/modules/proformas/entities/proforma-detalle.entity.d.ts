import { Proforma } from './proforma.entity';
import { Producto } from '../../productos/entities/producto.entity';
export declare class ProformaDetalle {
    id: number;
    proforma: Proforma;
    proforma_id: number;
    producto: Producto;
    producto_id: number;
    codigo: string;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    descuento: number;
    subtotal: number;
    impuesto: number;
    total: number;
}
