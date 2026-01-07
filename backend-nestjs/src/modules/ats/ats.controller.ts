import { Controller, Post, Body, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AtsService } from './ats.service';
import { GenerarAtsDto } from './dto/generar-ats.dto';

@Controller('ats')
export class AtsController {
    constructor(private readonly atsService: AtsService) { }

    @Post('generar')
    async generarATS(@Body() dto: GenerarAtsDto, @Res() res: Response) {
        try {
            const xml = await this.atsService.generarATS(dto);

            // Nombre del archivo
            const filename = `ATS_${dto.mes.toString().padStart(2, '0')}_${dto.anio}.xml`;

            // Configurar headers para descarga
            res.setHeader('Content-Type', 'application/xml');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            return res.status(HttpStatus.OK).send(xml);
        } catch (error) {
            console.error('Error generando ATS:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error al generar ATS',
                error: error.message
            });
        }
    }

    @Get('resumen')
    async obtenerResumen(@Query() dto: GenerarAtsDto) {
        const anio = parseInt(dto.anio?.toString());
        const mes = parseInt(dto.mes?.toString());

        return this.atsService.obtenerResumenPeriodo({ anio, mes });
    }
}
