import { Producto } from '../../productos/entities/producto.entity';
export declare class Promocion {
    id: number;
    nombre: string;
    descripcion: string;
    tipo: string;
    valor: number;
    producto: Producto;
    producto_id: number;
    categoria: string;
    fecha_inicio: Date;
    fecha_fin: Date;
    hora_inicio: string;
    hora_fin: string;
    dias_semana: string;
    minimo_compra: number;
    maximo_usos: number;
    usos_actuales: number;
    estado: string;
    created_at: Date;
    updated_at: Date;
}
