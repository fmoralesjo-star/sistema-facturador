import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
} from '@nestjs/common';
import { PuntosVentaService } from './puntos-venta.service';
import { CreatePuntoVentaDto } from './dto/create-punto-venta.dto';
import { UpdatePuntoVentaDto } from './dto/update-punto-venta.dto';

@Controller('puntos-venta')
export class PuntosVentaController {
    constructor(private readonly puntosVentaService: PuntosVentaService) { }

    @Post()
    create(@Body() createPuntoVentaDto: CreatePuntoVentaDto) {
        return this.puntosVentaService.create(createPuntoVentaDto);
    }

    @Get()
    findAll() {
        return this.puntosVentaService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.puntosVentaService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePuntoVentaDto: UpdatePuntoVentaDto,
    ) {
        return this.puntosVentaService.update(id, updatePuntoVentaDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.puntosVentaService.remove(id);
    }
}
