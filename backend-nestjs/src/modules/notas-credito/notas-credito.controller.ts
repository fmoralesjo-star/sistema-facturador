import { Controller, Get, Post, Body, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { NotasCreditoService } from './notas-credito.service';
import { RideService } from '../sri/services/ride.service';

@Controller('notas-credito')
export class NotasCreditoController {
    constructor(
        private readonly notasCreditoService: NotasCreditoService,
        private readonly rideService: RideService
    ) { }

    @Post()
    create(@Body() createDto: any) {
        return this.notasCreditoService.create(createDto);
    }

    @Get()
    findAll() {
        return this.notasCreditoService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.notasCreditoService.findOne(+id);
    }

    @Get(':id/pdf')
    async getPdf(@Param('id') id: string, @Res() res: Response) {
        const buffer = await this.rideService.obtenerRIDENotaCredito(+id);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename=NC-${id}.pdf`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
}
