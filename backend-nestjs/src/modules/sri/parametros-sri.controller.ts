import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ParametrosSriService } from './parametros-sri.service';

@Controller('sri/parametros')
export class ParametrosSriController {
    constructor(private readonly service: ParametrosSriService) { }

    // IVA
    @Get('iva')
    findAllIva() {
        return this.service.findAllIva();
    }

    @Post('iva')
    createIva(@Body() data: any) {
        return this.service.createIva(data);
    }

    @Patch('iva/:id/toggle')
    toggleIva(@Param('id', ParseIntPipe) id: number) {
        return this.service.toggleIva(id);
    }

    // Retenciones
    @Get('retenciones')
    findAllRetenciones() {
        return this.service.findAllRetenciones();
    }

    @Post('retenciones')
    createRetencion(@Body() data: any) {
        return this.service.createRetencion(data);
    }

    @Patch('retenciones/:id/toggle')
    toggleRetencion(@Param('id', ParseIntPipe) id: number) {
        return this.service.toggleRetencion(id);
    }

    // Sustento Tributario
    @Get('sustento')
    findAllSustento() {
        return this.service.findAllSustento();
    }

    @Post('sustento')
    createSustento(@Body() data: any) {
        return this.service.createSustento(data);
    }
}
