"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SriProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SriProcessor = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const factura_entity_1 = require("../../facturas/entities/factura.entity");
const sri_service_1 = require("../sri.service");
const circuit_breaker_service_1 = require("../services/circuit-breaker.service");
const postgres_queue_service_1 = require("../../common/services/postgres-queue.service");
const contabilidad_service_1 = require("../../contabilidad/contabilidad.service");
const schedule_1 = require("@nestjs/schedule");
let SriProcessor = SriProcessor_1 = class SriProcessor {
    constructor(sriService, facturaRepository, circuitBreakerService, queueService, contabilidadService, dataSource) {
        this.sriService = sriService;
        this.facturaRepository = facturaRepository;
        this.circuitBreakerService = circuitBreakerService;
        this.queueService = queueService;
        this.contabilidadService = contabilidadService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(SriProcessor_1.name);
        this.isProcessing = false;
    }
    async handleCron() {
        if (this.isProcessing)
            return;
        this.isProcessing = true;
        try {
            await this.processNextJob();
        }
        catch (error) {
            this.logger.error('Error en Queue Processor Loop:', error);
        }
        finally {
            this.isProcessing = false;
        }
    }
    async processNextJob() {
        const job = await this.queueService.getNextPendingJob('enviar-factura');
        if (!job)
            return;
        this.logger.log(`Procesando trabajo SRI #${job.id} (Intento ${job.attempts})`);
        try {
            const isInContingency = await this.circuitBreakerService.isContingenciaActiva();
            if (isInContingency) {
                this.logger.warn(`Trabajo SRI #${job.id} OMITIDO y POSPUESTO por Modo Contingencia`);
                await this.queueService.failJob(job.id, 'Modo Contingencia Activo', 5 * 60 * 1000);
                return;
            }
            const data = job.data;
            if (!data.xmlContent || !data.claveAcceso) {
                throw new Error('Datos incompletos para envío al SRI');
            }
            const configService = this.sriService.configService;
            const rucEmisor = configService.get('SRI_RUC_EMISOR', '');
            const xmlFirmado = await this.sriService.firmarXML(data.xmlContent, rucEmisor);
            const resultado = await this.sriService.enviarYAutorizar(xmlFirmado, data.claveAcceso, data.ambiente);
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                const factura = await queryRunner.manager.findOne(factura_entity_1.Factura, {
                    where: { id: data.facturaId },
                    relations: ['cliente', 'detalles', 'detalles.producto']
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
                            if (!factura.asiento_contable_creado) {
                                try {
                                    this.logger.log(`Generando asiento contable para factura ${factura.numero}...`);
                                    const asiento = await this.contabilidadService.crearAsientosFactura(factura, queryRunner);
                                    factura.asiento_contable_creado = true;
                                    factura.numero_asiento_contable = asiento.numero_asiento;
                                    this.logger.log(`Asiento generado: ${asiento.numero_asiento}`);
                                }
                                catch (contabilidadError) {
                                    this.logger.error(`Error generando asiento contable: ${contabilidadError.message}`);
                                }
                            }
                        }
                        else {
                            factura.estado = 'RECHAZADA';
                            factura.mensaje_sri = resultado.autorizacion.mensajes?.[0]?.mensaje || 'Rechazado por el SRI';
                        }
                    }
                    await queryRunner.manager.save(factura_entity_1.Factura, factura);
                }
                await queryRunner.commitTransaction();
            }
            catch (err) {
                await queryRunner.rollbackTransaction();
                throw err;
            }
            finally {
                await queryRunner.release();
            }
            await this.circuitBreakerService.registrarExito();
            await this.queueService.completeJob(job.id);
            this.logger.log(`Trabajo SRI #${job.id} COMPLETADO.`);
        }
        catch (error) {
            await this.circuitBreakerService.registrarFallo(error);
            this.logger.error(`Error procesando trabajo SRI #${job.id}: ${error.message}`);
            const delay = 60000 * (job.attempts || 1);
            await this.queueService.failJob(job.id, error.message, delay);
        }
    }
};
exports.SriProcessor = SriProcessor;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SriProcessor.prototype, "handleCron", null);
exports.SriProcessor = SriProcessor = SriProcessor_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(factura_entity_1.Factura)),
    __metadata("design:paramtypes", [sri_service_1.SriService,
        typeorm_2.Repository,
        circuit_breaker_service_1.CircuitBreakerService,
        postgres_queue_service_1.PostgresQueueService,
        contabilidad_service_1.ContabilidadService,
        typeorm_2.DataSource])
], SriProcessor);
//# sourceMappingURL=sri.processor.js.map