import { PuntoVenta } from '../../puntos-venta/entities/punto-venta.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
export declare enum CategoriaGasto {
    SERVICIOS_PUBLICOS = "SERVICIOS_PUBLICOS",
    INTERNET_TELEFONIA = "INTERNET_TELEFONIA",
    SUMINISTROS_OFICINA = "SUMINISTROS_OFICINA",
    LIMPIEZA = "LIMPIEZA",
    TRANSPORTE = "TRANSPORTE",
    ALIMENTACION = "ALIMENTACION",
    REPRESENTACION = "REPRESENTACION",
    REPOSICION_FONDO = "REPOSICION_FONDO",
    VARIOS = "VARIOS"
}
export declare class CajaChicaMovimiento {
    id: number;
    punto_venta_id: number;
    punto_venta: PuntoVenta;
    tipo: 'INGRESO' | 'GASTO';
    categoria: CategoriaGasto;
    es_deducible: boolean;
    monto: number;
    descripcion: string;
    referencia: string;
    numero_documento: string;
    proveedor_nombre: string;
    fecha: Date;
    usuario_id: number;
    usuario: Usuario;
    saldo_resultante: number;
}
