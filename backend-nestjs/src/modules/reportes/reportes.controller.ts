import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ReportesService } from './reportes.service';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) { }

  @Get('ventas-por-vendedor')
  reporteVentasPorVendedor(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.reportesService.reporteVentasPorVendedor(
      fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin ? new Date(fechaFin) : undefined,
    );
  }

  @Get('productos-mas-vendidos')
  reporteProductosMasVendidos(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('limite', ParseIntPipe) limite?: number,
  ) {
    return this.reportesService.reporteProductosMasVendidos(
      fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin ? new Date(fechaFin) : undefined,
      limite || 10,
    );
  }

  @Get('rotacion-inventario')
  reporteRotacionInventario() {
    return this.reportesService.reporteRotacionInventario();
  }

  @Get('efectividad-promociones')
  reporteEfectividadPromociones(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.reportesService.reporteEfectividadPromociones(
      fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin ? new Date(fechaFin) : undefined,
    );
  }

  @Get('compras-vs-ventas')
  reporteComprasVsVentas(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.reportesService.reporteComprasVsVentas(
      fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin ? new Date(fechaFin) : undefined,
    );
  }
  @Get('balance-general')
  balanceGeneral(@Query('fechaCorte') fechaCorte: string) {
    return this.reportesService.generarBalanceGeneral(
      fechaCorte ? new Date(fechaCorte) : new Date(),
    );
  }

  @Get('estado-resultados')
  estadoResultados(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.reportesService.generarEstadoResultados(
      fechaInicio ? new Date(fechaInicio) : new Date(new Date().getFullYear(), 0, 1),
      fechaFin ? new Date(fechaFin) : new Date(),
    );
  }
  @Get('libro-diario')
  libroDiario(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.reportesService.generarLibroDiario(
      fechaInicio ? new Date(fechaInicio) : new Date(),
      fechaFin ? new Date(fechaFin) : new Date(),
    );
  }

  @Get('libro-mayor')
  libroMayor(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('cuentaId') cuentaId?: string,
  ) {
    return this.reportesService.generarLibroMayor(
      fechaInicio ? new Date(fechaInicio) : new Date(),
      fechaFin ? new Date(fechaFin) : new Date(),
      cuentaId ? parseInt(cuentaId) : undefined,
    );
  }
  @Get('flujo-caja')
  flujoCaja(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.reportesService.generarFlujoCaja(
      fechaInicio ? new Date(fechaInicio) : new Date(new Date().getFullYear(), 0, 1),
      fechaFin ? new Date(fechaFin) : new Date(),
    );
  }
}












