import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ContabilidadService } from './contabilidad.service';
import { CreateAsientoDto } from './dto/create-asiento.dto';
import { RestrictFinancialInfo } from '../administracion-ti/decorators/restrict-financial-info.decorator';

@Controller('contabilidad')
export class ContabilidadController {
  constructor(private readonly contabilidadService: ContabilidadService) { }

  @Post('asientos')
  createAsiento(@Body() createDto: CreateAsientoDto) {
    return this.contabilidadService.createAsiento(createDto);
  }

  @Get('asientos')
  getAsientos() {
    return this.contabilidadService.findAllAsientos();
  }

  @Get('asientos/:id')
  getAsiento(@Param('id') id: string) {
    return this.contabilidadService.findOneAsiento(+id);
  }

  @Post('generar-ejemplos')
  generarEjemplos() {
    return this.contabilidadService.generarDatosEjemplo();
  }

  // @RestrictFinancialInfo()
  @Get('balance')
  getBalance() {
    return this.contabilidadService.obtenerBalanceGeneral();
  }

  // @RestrictFinancialInfo()
  @Get('resumen')
  getResumen(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.contabilidadService.obtenerResumen(fechaInicio, fechaFin);
  }
}

