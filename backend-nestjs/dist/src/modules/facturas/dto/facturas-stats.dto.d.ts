export interface FacturasStatsDto {
    total_facturado_mes: number;
    iva_por_pagar: number;
    comprobantes_rechazados: number;
    comprobantes_autorizados: number;
    comprobantes_pendientes: number;
    total_facturas: number;
}
