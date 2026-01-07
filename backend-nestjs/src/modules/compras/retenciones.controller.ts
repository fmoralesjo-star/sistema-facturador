import { Controller, Get, Post, Param, Query, ParseIntPipe, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { RetencionesService } from './services/retenciones.service';

@Controller('retenciones')
export class RetencionesController {
    constructor(private readonly retencionesService: RetencionesService) { }

    @Get()
    async findAll(
        @Query('desde') desde?: string,
        @Query('hasta') hasta?: string,
        @Query('estado') estado?: string,
    ) {
        const filtros = {
            desde: desde ? new Date(desde) : undefined,
            hasta: hasta ? new Date(hasta) : undefined,
            estado: estado,
        };
        return this.retencionesService.findAll(filtros);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.retencionesService.findOne(id);
    }

    @Get('compra/:compraId')
    async findByCompra(@Param('compraId', ParseIntPipe) compraId: number) {
        return this.retencionesService.findByCompra(compraId);
    }

    @Get(':id/pdf')
    async downloadPdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        const retencion = await this.retencionesService.findOne(id);
        if (!retencion || !retencion.pdf_path) {
            throw new NotFoundException('Retención o PDF no encontrado');
        }

        const fs = require('fs');
        if (!fs.existsSync(retencion.pdf_path)) {
            throw new NotFoundException('El archivo PDF no existe en el servidor');
        }

        res.download(retencion.pdf_path);
    }
}
