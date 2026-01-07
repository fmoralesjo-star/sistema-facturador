import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FlujosOperativosService } from './flujos-operativos.service';

@Controller('inventario/flujos')
export class FlujosOperativosController {
  constructor(private readonly flujosService: FlujosOperativosService) {}

  // ========== A. RECEPCIÓN Y COMPRAS ==========
  @Post('ordenes-compra')
  @HttpCode(HttpStatus.CREATED)
  crearOrdenCompra(@Body() data: any) {
    return this.flujosService.crearOrdenCompra(data);
  }

  @Get('ordenes-compra')
  obtenerOrdenesCompra() {
    return this.flujosService.obtenerOrdenesCompra();
  }

  @Post('albaranes')
  @HttpCode(HttpStatus.CREATED)
  crearAlbaran(@Body() data: any) {
    return this.flujosService.crearAlbaran(data);
  }

  @Get('albaranes')
  obtenerAlbaranes() {
    return this.flujosService.obtenerAlbaranes();
  }

  // ========== B. MOVIMIENTOS ==========
  @Post('transferencias')
  @HttpCode(HttpStatus.CREATED)
  crearTransferencia(@Body() data: any) {
    return this.flujosService.crearTransferencia(data);
  }

  @Get('transferencias')
  obtenerTransferencias() {
    return this.flujosService.obtenerTransferencias();
  }

  @Post('ajustes')
  @HttpCode(HttpStatus.CREATED)
  registrarAjuste(@Body() data: any) {
    return this.flujosService.registrarAjuste(data);
  }

  @Get('ajustes')
  obtenerAjustes() {
    return this.flujosService.obtenerAjustes();
  }

  // ========== C. DESPACHO Y VENTAS ==========
  @Post('pickings')
  @HttpCode(HttpStatus.CREATED)
  crearPicking(@Body() data: any) {
    return this.flujosService.crearPicking(data);
  }

  @Get('pickings')
  obtenerPickings() {
    return this.flujosService.obtenerPickings();
  }

  // ========== D. AUDITORÍA ==========
  @Post('conteos-ciclicos')
  @HttpCode(HttpStatus.CREATED)
  crearConteoCiclico(@Body() data: any) {
    return this.flujosService.crearConteoCiclico(data);
  }

  @Get('conteos-ciclicos')
  obtenerConteosCiclicos() {
    return this.flujosService.obtenerConteosCiclicos();
  }
}
















