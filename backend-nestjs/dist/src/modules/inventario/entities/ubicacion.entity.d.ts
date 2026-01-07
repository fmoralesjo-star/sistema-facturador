import { ProductoUbicacion } from './producto-ubicacion.entity';
export declare class Ubicacion {
    id: number;
    nombre: string;
    codigo: string;
    tipo: string;
    descripcion: string;
    direccion: string;
    activa: boolean;
    productosUbicacion: ProductoUbicacion[];
    created_at: Date;
    updated_at: Date;
}
