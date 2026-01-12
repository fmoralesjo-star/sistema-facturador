import { Controller, Get, Query } from '@nestjs/common';
import { KpisService } from './kpis.service';

@Controller('contabilidad/kpis')
export class KpisController {
    constructor(private readonly kpisService: KpisService) { }

    @Get('punto-equilibrio')
    async getPuntoEquilibrio(@Query('periodo') periodo: string = 'mes') {
        return this.kpisService.calcularPuntoEquilibrio(periodo);
    }

    @Get('margenes-utilidad')
    async getMargenesUtilidad(
        @Query('fecha_inicio') fechaInicio: string,
        @Query('fecha_fin') fechaFin: string
    ) {
        return this.kpisService.calcularMargenesUtilidad(fechaInicio, fechaFin);
    }

    @Get('top-productos')
    async getTopProductos(
        @Query('limite') limite: number = 5,
        @Query('periodo') periodo: string = 'mes'
    ) {
        return this.kpisService.obtenerTopProductos(limite, periodo);
    }

    @Get('roi')
    async getROI(
        @Query('fecha_inicio') fechaInicio: string,
        @Query('fecha_fin') fechaFin: string
    ) {
        return this.kpisService.calcularROI(fechaInicio, fechaFin);
    }

    @Get('rotacion-inventario')
    async getRotacionInventario(@Query('periodo') periodo: string = 'mes') {
        return this.kpisService.calcularRotacionInventario(periodo);
    }

    @Get('dias-cuentas-cobrar')
    async getDiasCuentasCobrar() {
        return this.kpisService.calcularDiasCuentasCobrar();
    }

    @Get('ratio-corriente')
    async getRatioCorriente() {
        return this.kpisService.calcularRatioCorriente();
    }

    @Get('resumen-completo')
    async getResumenCompleto(
        @Query('periodo') periodo: string = 'mes'
    ) {
        return this.kpisService.obtenerResumenCompleto(periodo);
    }

    @Get('ventas/vendedores')
    async getVentasPorVendedor(@Query('periodo') periodo: string = 'mes') {
        return this.kpisService.obtenerVentasPorVendedor(periodo);
    }

    @Get('ventas/locales')
    async getVentasPorLocal(@Query('periodo') periodo: string = 'mes') {
        return this.kpisService.obtenerVentasPorLocal(periodo);
    }

    @Get('ventas/resumen')
    async getResumenVentas(@Query('periodo') periodo: string = 'mes') {
        return this.kpisService.obtenerResumenVentas(periodo);
    }
}
