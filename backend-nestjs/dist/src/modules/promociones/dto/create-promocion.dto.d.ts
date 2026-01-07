export declare class CreatePromocionDto {
    nombre: string;
    descripcion?: string;
    tipo: 'descuento_porcentaje' | 'descuento_fijo' | 'compra_x_lleva_y' | 'envio_gratis';
    valor?: number;
    producto_id?: number;
    categoria?: string;
    fecha_inicio: Date;
    fecha_fin?: Date;
    hora_inicio?: string;
    hora_fin?: string;
    dias_semana?: string[];
    minimo_compra?: number;
    maximo_usos?: number;
    usos_actuales?: number;
    estado: 'activa' | 'inactiva';
}
