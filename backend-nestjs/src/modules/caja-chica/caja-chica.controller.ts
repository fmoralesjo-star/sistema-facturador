import { Controller, Get, Post, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { CajaChicaService } from './caja-chica.service';
import { CreateCajaChicaMovimientoDto } from './dto/create-caja-chica-movimiento.dto';

@Controller('caja-chica')
export class CajaChicaController {
    constructor(private readonly cajaChicaService: CajaChicaService) { }

    @Post('movimiento')
    registrarMovimiento(@Body() createDto: CreateCajaChicaMovimientoDto) {
        return this.cajaChicaService.registrarMovimiento(createDto);
    }

    @Get('saldo/:puntoVentaId')
    obtenerSaldoActual(@Param('puntoVentaId', ParseIntPipe) puntoVentaId: number) {
        return this.cajaChicaService.obtenerSaldoActual(puntoVentaId);
    }

    @Get('historial/:puntoVentaId')
    obtenerHistorial(
        @Param('puntoVentaId', ParseIntPipe) puntoVentaId: number,
        @Query('fechaInicio') fechaInicio?: string,
        @Query('fechaFin') fechaFin?: string
    ) {
        return this.cajaChicaService.obtenerHistorial(puntoVentaId, fechaInicio, fechaFin);
    }
}
