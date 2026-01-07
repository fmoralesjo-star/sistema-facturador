import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { CreateFacturaDto } from './dto/create-factura.dto';

@Controller('facturas')
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createFacturaDto: CreateFacturaDto) {
    return this.facturasService.create(createFacturaDto);
  }

  @Get()
  findAll() {
    return this.facturasService.findAll();
  }

  @Get('estadisticas')
  obtenerEstadisticas() {
    return this.facturasService.obtenerEstadisticas();
  }

  @Get('buscar')
  buscarFacturas(@Query() filtros: {
    fechaInicio?: string;
    fechaFin?: string;
    clienteId?: string;
    estadoSri?: string;
  }) {
    return this.facturasService.buscarFacturas({
      fechaInicio: filtros.fechaInicio,
      fechaFin: filtros.fechaFin,
      clienteId: filtros.clienteId ? parseInt(filtros.clienteId) : undefined,
      estadoSri: filtros.estadoSri,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facturasService.findOne(id);
  }

  @Put(':id/estado')
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: string,
  ) {
    return this.facturasService.updateEstado(id, estado);
  }

  @Post(':id/anular')
  anular(@Param('id', ParseIntPipe) id: number) {
    return this.facturasService.anular(id);
  }
}

