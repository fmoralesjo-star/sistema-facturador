import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ConciliacionesService } from './conciliaciones.service';
import { CreateConciliacionDto } from './dto/create-conciliacion.dto';

@Controller('conciliaciones')
export class ConciliacionesController {
  constructor(private readonly conciliacionesService: ConciliacionesService) { }

  @Post()
  create(@Body() createConciliacionDto: CreateConciliacionDto) {
    return this.conciliacionesService.create(createConciliacionDto);
  }

  @Get()
  findAll(@Query('banco_id') bancoId?: string, @Query('factura_id') facturaId?: string) {
    if (bancoId) {
      return this.conciliacionesService.findByBanco(+bancoId);
    }
    if (facturaId) {
      return this.conciliacionesService.findByFactura(+facturaId);
    }
    return this.conciliacionesService.findAll();
  }

  @Get('extracto')
  findAllExtracto(@Query('banco_id') bancoId: string) {
    return this.conciliacionesService.findAllExtracto(+bancoId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conciliacionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<CreateConciliacionDto>) {
    return this.conciliacionesService.update(+id, updateData);
  }

  @Patch(':id/conciliar')
  conciliar(@Param('id') id: string) {
    return this.conciliacionesService.conciliar(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conciliacionesService.remove(+id);
  }

  @Post('sincronizar-factura/:facturaId')
  sincronizarConFactura(@Param('facturaId') facturaId: string, @Body() pagos: any[]) {
    return this.conciliacionesService.sincronizarConFactura(+facturaId, pagos);
  }

  @Post('importar-extracto')
  importarExtracto(@Body() body: { banco_id: number, csv: string }) {
    return this.conciliacionesService.importarExtracto(body.banco_id, body.csv);
  }

  // Endpoints de IA
  @Post('ia/procesar-extracto')
  procesarExtractoIA(@Body() body: { data: any[], banco_id: number }) {
    return this.conciliacionesService.procesarExtractoIA(body.data, body.banco_id);
  }

  @Get('ia/pendientes')
  getPendientes(@Query('banco_id') bancoId?: string) {
    return this.conciliacionesService.getPendientesIA(bancoId ? +bancoId : undefined);
  }

  @Get('ia/transacciones/:id/sugerencias')
  getSugerenciasIA(@Param('id') id: string) {
    return this.conciliacionesService.getSugerenciasIA(+id);
  }

  @Post('ia/transacciones/:id/confirmar')
  confirmarMatchIA(
    @Param('id') transaccionId: string,
    @Body('conciliacion_id') conciliacionId: number
  ) {
    return this.conciliacionesService.confirmarMatchIA(+transaccionId, conciliacionId);
  }

  @Get('ia/estadisticas')
  getEstadisticasIA(@Query('banco_id') bancoId?: string) {
    return this.conciliacionesService.getEstadisticasIA(bancoId ? +bancoId : undefined);
  }
}












