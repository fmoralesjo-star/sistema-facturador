import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { DatosEjemploService } from '../services/datos-ejemplo.service';

@Controller('contabilidad/datos-ejemplo')
export class DatosEjemploController {
  constructor(private readonly datosEjemploService: DatosEjemploService) {}

  @Post('generar')
  @HttpCode(HttpStatus.CREATED)
  async generarDatosEjemplo() {
    return this.datosEjemploService.generarDatosEjemplo();
  }

  @Post('limpiar')
  @HttpCode(HttpStatus.OK)
  async limpiarDatosEjemplo() {
    return this.datosEjemploService.limpiarDatosEjemplo();
  }
}


















