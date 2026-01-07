import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; // Added DataSource
import { Factura } from '../../facturas/entities/factura.entity';
import { SriService, SriJobData } from '../sri.service';
import { CircuitBreakerService } from '../services/circuit-breaker.service';
import { PostgresQueueService } from '../../common/services/postgres-queue.service';
import { ContabilidadService } from '../../contabilidad/contabilidad.service'; // Added import
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SriProcessor {
  private readonly logger = new Logger(SriProcessor.name);
  private isProcessing = false;

  constructor(
    private readonly sriService: SriService,
    @InjectRepository(Factura)
    private facturaRepository: Repository<Factura>,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly queueService: PostgresQueueService,
    private readonly contabilidadService: ContabilidadService, // Injected service
    private readonly dataSource: DataSource, // Injected DataSource for transactions
  ) {
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      await this.processNextJob();
    } catch (error) {
      this.logger.error('Error en Queue Processor Loop:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async processNextJob() {
    const job = await this.queueService.getNextPendingJob('enviar-factura');
    if (!job) return;

    this.logger.log(`Procesando trabajo SRI #${job.id} (Intento ${job.attempts})`);

    try {
      // Circuit Breaker Check
      const isInContingency = await this.circuitBreakerService.isContingenciaActiva();
      if (isInContingency) {
        this.logger.warn(`Trabajo SRI #${job.id} OMITIDO y POSPUESTO por Modo Contingencia`);
        // Se pospone 5 minutos
        await this.queueService.failJob(job.id, 'Modo Contingencia Activo', 5 * 60 * 1000);
        return;
      }

      const data = job.data as SriJobData;

      // Validar datos
      if (!data.xmlContent || !data.claveAcceso) {
        throw new Error('Datos incompletos para envío al SRI');
      }

      // Firmar XML
      const configService = (this.sriService as any).configService;
      const rucEmisor = configService.get('SRI_RUC_EMISOR', '');
      const xmlFirmado = await this.sriService.firmarXML(
        data.xmlContent,
        rucEmisor,
      );

      // Enviar al SRI
      const resultado = await this.sriService.enviarYAutorizar(
        xmlFirmado,
        data.claveAcceso,
        data.ambiente,
      );

      // Iniciar transacción para actualizar factura y crear asiento
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const factura = await queryRunner.manager.findOne(Factura, {
          where: { id: data.facturaId },
          relations: ['cliente', 'detalles', 'detalles.producto'] // Cargar detalles necesarios para el asiento
        });

        if (factura) {
          factura.estado_sri = resultado.recepcion.estado || 'PENDIENTE';
          factura.mensaje_sri = resultado.recepcion.mensaje || '';

          if (resultado.autorizacion) {
            if (resultado.autorizacion.autorizado) {
              factura.autorizacion = resultado.autorizacion.numeroAutorizacion || '';
              factura.fecha_autorizacion = resultado.autorizacion.fechaAutorizacion
                ? new Date(resultado.autorizacion.fechaAutorizacion)
                : new Date();
              factura.estado = 'AUTORIZADA';
              factura.xml_autorizado = resultado.autorizacion.comprobante || null;

              // Generar Asiento Contable Automático
              if (!factura.asiento_contable_creado) {
                try {
                  this.logger.log(`Generando asiento contable para factura ${factura.numero}...`);
                  const asiento = await this.contabilidadService.crearAsientosFactura(factura, queryRunner);
                  factura.asiento_contable_creado = true;
                  factura.numero_asiento_contable = asiento.numero_asiento;
                  this.logger.log(`Asiento generado: ${asiento.numero_asiento}`);
                } catch (contabilidadError) {
                  this.logger.error(`Error generando asiento contable: ${contabilidadError.message}`);
                  // No fallamos todo el proceso SRI, pero dejamos constancia
                  // Podríamos lanzar error para revertir transacción si la contabilidad es estricta
                  // Por ahora, asumimos que se debe guardar el estado SRI aunque falle contabilidad (y reintentar asiento luego)
                  // O mejor: SI falla contabilidad, revertimos todo y reintentamos el job SRI?
                  // Riesgo: SRI ya autorizó, si revertimos DB, volvemos a enviar a SRI y dará "YA AUTORIZADO".
                  // Solución: Advertir pero guardar el estado SRI.
                }
              }

            } else {
              factura.estado = 'RECHAZADA';
              factura.mensaje_sri = resultado.autorizacion.mensajes?.[0]?.mensaje || 'Rechazado por el SRI';
            }
          }
          await queryRunner.manager.save(Factura, factura);
        }

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }

      // Reportar éxito
      await this.circuitBreakerService.registrarExito();
      await this.queueService.completeJob(job.id);
      this.logger.log(`Trabajo SRI #${job.id} COMPLETADO.`);

    } catch (error) {
      // Reportar fallo
      await this.circuitBreakerService.registrarFallo(error);

      this.logger.error(`Error procesando trabajo SRI #${job.id}: ${error.message}`);

      // Reintentar en 1 minuto * intentos (Backoff lineal simple)
      const delay = 60000 * (job.attempts || 1);
      await this.queueService.failJob(job.id, error.message, delay);
    }
  }
}


