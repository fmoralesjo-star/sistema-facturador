import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ContingenciaService } from './contingencia.service';

@Injectable()
export class ContingenciaScheduler {
    private readonly logger = new Logger(ContingenciaScheduler.name);

    constructor(private readonly contingenciaService: ContingenciaService) { }

    /**
     * Job que se ejecuta cada 5 minutos para procesar la cola de documentos pendientes
     */
    // @Cron('*/5 * * * *', {
    //    name: 'procesar-cola-contingencia',
    // })
    async procesarColaAutomaticamente() {
        this.logger.log('⏰ Ejecutando job de procesamiento de cola de contingencia...');

        try {
            const resultado = await this.contingenciaService.procesarColaContingencia();

            if (resultado.procesados > 0) {
                this.logger.log(
                    `✅ Job completado: ${resultado.exitosos} exitosos, ${resultado.fallidos} fallidos de ${resultado.procesados} procesados`
                );
            }
        } catch (error) {
            this.logger.error(`❌ Error en job de contingencia: ${error.message}`);
        }
    }
}
