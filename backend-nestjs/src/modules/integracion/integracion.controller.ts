import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { IntegracionService } from './integracion.service';

@Controller('integracion')
export class IntegracionController {
  constructor(private readonly integracionService: IntegracionService) {}

  @Get('estadisticas')
  obtenerEstadisticas() {
    return this.integracionService.obtenerEstadisticasConsolidadas();
  }

  @Get('producto/:id')
  obtenerProductoIntegrado(@Param('id', ParseIntPipe) id: number) {
    return this.integracionService.obtenerProductoIntegrado(id);
  }

  @Get('factura/:id')
  obtenerFacturaIntegrada(@Param('id', ParseIntPipe) id: number) {
    return this.integracionService.obtenerFacturaIntegrada(id);
  }
}












