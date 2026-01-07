import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ReportesService } from '../services/reportes.service';

@Controller('contabilidad/reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  /**
   * Balance General
   * GET /api/contabilidad/reportes/balance-general?fechaCorte=2024-01-31
   */
  @Get('balance-general')
  async balanceGeneral(@Query('fechaCorte') fechaCorte?: string) {
    const fecha = fechaCorte ? new Date(fechaCorte) : undefined;
    return this.reportesService.generarBalanceGeneral(fecha);
  }

  /**
   * Estado de Pérdidas y Ganancias
   * GET /api/contabilidad/reportes/perdidas-ganancias?fechaInicio=2024-01-01&fechaFin=2024-01-31
   */
  @Get('perdidas-ganancias')
  async perdidasGanancias(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    if (!fechaInicio || !fechaFin) {
      throw new Error(
        'Se requieren fechaInicio y fechaFin (formato: YYYY-MM-DD)',
      );
    }
    return this.reportesService.generarEstadoPerdidasGanancias(
      new Date(fechaInicio),
      new Date(fechaFin),
    );
  }

  /**
   * Libro Mayor de una cuenta específica
   * GET /api/contabilidad/reportes/libro-mayor/1?fechaInicio=2024-01-01&fechaFin=2024-01-31
   */
  @Get('libro-mayor/:cuentaId')
  async libroMayor(
    @Param('cuentaId', ParseIntPipe) cuentaId: number,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : undefined;
    const fechaFinDate = fechaFin ? new Date(fechaFin) : undefined;
    return this.reportesService.generarLibroMayor(
      cuentaId,
      fechaInicioDate,
      fechaFinDate,
    );
  }

  /**
   * Lista de cuentas para seleccionar en Libro Mayor
   */
  @Get('cuentas-libro-mayor')
  async cuentasLibroMayor() {
    return this.reportesService.obtenerCuentasParaLibroMayor();
  }
}


















