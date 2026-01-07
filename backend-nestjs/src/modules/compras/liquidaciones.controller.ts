import { Controller, Get, Post, Body, Param, Query, Patch, ParseIntPipe } from '@nestjs/common';
import { LiquidacionesService } from './services/liquidaciones.service';
import { CreateLiquidacionDto } from './dto/create-liquidacion.dto';

@Controller('liquidaciones-compra')
export class LiquidacionesController {
    constructor(private readonly liquidacionesService: LiquidacionesService) { }

    @Post()
    create(@Body() createDto: CreateLiquidacionDto) {
        return this.liquidacionesService.create(createDto);
    }

    @Get()
    findAll(
        @Query('desde') desde?: string,
        @Query('hasta') hasta?: string,
        @Query('estado') estado?: string,
    ) {
        const filtros = {
            desde: desde ? new Date(desde) : undefined,
            hasta: hasta ? new Date(hasta) : undefined,
            estado,
        };
        return this.liquidacionesService.findAll(filtros);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.liquidacionesService.findOne(id);
    }

    @Patch(':id/anular')
    anular(@Param('id', ParseIntPipe) id: number) {
        return this.liquidacionesService.anular(id);
    }
}
