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
var ContingenciaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContingenciaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const documento_pendiente_sri_entity_1 = require("./entities/documento-pendiente-sri.entity");
const axios_1 = require("axios");
let ContingenciaService = ContingenciaService_1 = class ContingenciaService {
    constructor(documentosPendientesRepo) {
        this.documentosPendientesRepo = documentosPendientesRepo;
        this.logger = new common_1.Logger(ContingenciaService_1.name);
        this.MAX_REINTENTOS = 10;
        this.TIMEOUT_SRI = 30000;
    }
    async agregarAColaContingencia(tipoDocumento, documentoId, numeroDocumento, clienteNombre, xmlContenido, claveAcceso) {
        const documento = this.documentosPendientesRepo.create({
            tipo_documento: tipoDocumento,
            documento_id: documentoId,
            numero_documento: numeroDocumento,
            cliente_nombre: clienteNombre,
            xml_contenido: xmlContenido,
            clave_acceso: claveAcceso,
            estado: 'PENDIENTE',
            intentos: 0,
        });
        const saved = await this.documentosPendientesRepo.save(documento);
        this.logger.log(`✅ Documento ${tipoDocumento} ${numeroDocumento} agregado a cola de contingencia`);
        return saved;
    }
    async obtenerDocumentosPendientes(filtros) {
        const query = this.documentosPendientesRepo.createQueryBuilder('doc');
        if (filtros?.tipo) {
            query.andWhere('doc.tipo_documento = :tipo', { tipo: filtros.tipo });
        }
        if (filtros?.estado) {
            query.andWhere('doc.estado = :estado', { estado: filtros.estado });
        }
        else {
            query.andWhere('doc.estado IN (:...estados)', { estados: ['PENDIENTE', 'ENVIANDO'] });
        }
        query.orderBy('doc.fecha_creacion', 'ASC');
        if (filtros?.limite) {
            query.limit(filtros.limite);
        }
        return await query.getMany();
    }
    async obtenerContadorDocumentosRepresados() {
        const pendientes = await this.documentosPendientesRepo
            .createQueryBuilder('doc')
            .select('doc.tipo_documento', 'tipo')
            .addSelect('COUNT(*)', 'cantidad')
            .where('doc.estado IN (:...estados)', { estados: ['PENDIENTE', 'ENVIANDO'] })
            .groupBy('doc.tipo_documento')
            .getRawMany();
        const contador = {
            total: 0,
            facturas: 0,
            notasCredito: 0,
            anulaciones: 0,
            retenciones: 0,
        };
        pendientes.forEach((item) => {
            const cantidad = parseInt(item.cantidad, 10);
            contador.total += cantidad;
            switch (item.tipo) {
                case 'FACTURA':
                    contador.facturas = cantidad;
                    break;
                case 'NOTA_CREDITO':
                    contador.notasCredito = cantidad;
                    break;
                case 'ANULACION':
                    contador.anulaciones = cantidad;
                    break;
                case 'RETENCION':
                    contador.retenciones = cantidad;
                    break;
            }
        });
        return contador;
    }
    async verificarEstadoSRI() {
        try {
            const ambiente = process.env.SRI_AMBIENTE || 'pruebas';
            const baseUrl = ambiente === 'produccion'
                ? 'https://cel.sri.gob.ec'
                : 'https://celospruebas.sri.gob.ec';
            const endpoint = `${baseUrl}/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl`;
            const response = await axios_1.default.get(endpoint, {
                timeout: 5000,
                validateStatus: (status) => status < 500,
            });
            return response.status < 400;
        }
        catch (error) {
            this.logger.warn(`SRI no disponible: ${error.message}`);
            return false;
        }
    }
    async procesarColaContingencia() {
        this.logger.log('🔄 Iniciando procesamiento de cola de contingencia...');
        const sriDisponible = await this.verificarEstadoSRI();
        if (!sriDisponible) {
            this.logger.warn('⚠️ SRI no disponible - cancelando procesamiento');
            return { procesados: 0, exitosos: 0, fallidos: 0, errores: ['SRI no disponible'] };
        }
        const documentos = await this.obtenerDocumentosPendientes({ limite: 50 });
        if (documentos.length === 0) {
            this.logger.log('✅ No hay documentos pendientes en la cola');
            return { procesados: 0, exitosos: 0, fallidos: 0, errores: [] };
        }
        this.logger.log(`📤 Procesando ${documentos.length} documentos...`);
        const resultados = {
            procesados: 0,
            exitosos: 0,
            fallidos: 0,
            errores: [],
        };
        for (const documento of documentos) {
            try {
                resultados.procesados++;
                documento.estado = 'ENVIANDO';
                documento.intentos++;
                documento.ultimo_intento = new Date();
                await this.documentosPendientesRepo.save(documento);
                const resultado = await this.enviarDocumentoAlSRI(documento);
                if (resultado.exito) {
                    documento.estado = 'AUTORIZADA';
                    documento.fecha_autorizacion = new Date();
                    documento.numero_autorizacion = resultado.numeroAutorizacion;
                    await this.documentosPendientesRepo.save(documento);
                    resultados.exitosos++;
                    this.logger.log(`✅ ${documento.tipo_documento} ${documento.numero_documento} autorizado`);
                }
                else {
                    throw new Error(resultado.error);
                }
            }
            catch (error) {
                resultados.fallidos++;
                const errorMsg = `${documento.tipo_documento} ${documento.numero_documento}: ${error.message}`;
                resultados.errores.push(errorMsg);
                documento.ultimo_error = error.message;
                if (documento.intentos >= this.MAX_REINTENTOS) {
                    documento.estado = 'ERROR_PERMANENTE';
                    this.logger.error(`❌ ${documento.tipo_documento} ${documento.numero_documento} - Error permanente después de ${this.MAX_REINTENTOS} intentos`);
                }
                else {
                    documento.estado = 'PENDIENTE';
                }
                await this.documentosPendientesRepo.save(documento);
            }
        }
        this.logger.log(`✅ Procesamiento completado: ${resultados.exitosos} exitosos, ${resultados.fallidos} fallidos`);
        return resultados;
    }
    async enviarDocumentoAlSRI(documento) {
        try {
            const ambiente = process.env.SRI_AMBIENTE || 'pruebas';
            const baseUrl = ambiente === 'produccion'
                ? 'https://cel.sri.gob.ec'
                : 'https://celospruebas.sri.gob.ec';
            const endpoint = `${baseUrl}/comprobantes-electronicos-ws/RecepcionComprobantesOffline`;
            const response = await axios_1.default.post(endpoint, documento.xml_contenido, {
                headers: { 'Content-Type': 'text/xml' },
                timeout: this.TIMEOUT_SRI,
            });
            const numeroAutorizacion = this.extraerNumeroAutorizacion(response.data);
            return {
                exito: true,
                numeroAutorizacion,
            };
        }
        catch (error) {
            return {
                exito: false,
                error: error.message,
            };
        }
    }
    extraerNumeroAutorizacion(respuestaXML) {
        return `AUTH-${Date.now()}`;
    }
    async reintentarEnvioDocumento(id) {
        const documento = await this.documentosPendientesRepo.findOne({ where: { id } });
        if (!documento) {
            return { exito: false, mensaje: 'Documento no encontrado' };
        }
        if (documento.estado === 'AUTORIZADA') {
            return { exito: false, mensaje: 'El documento ya está autorizado' };
        }
        try {
            documento.estado = 'ENVIANDO';
            documento.intentos++;
            documento.ultimo_intento = new Date();
            await this.documentosPendientesRepo.save(documento);
            const resultado = await this.enviarDocumentoAlSRI(documento);
            if (resultado.exito) {
                documento.estado = 'AUTORIZADA';
                documento.fecha_autorizacion = new Date();
                documento.numero_autorizacion = resultado.numeroAutorizacion;
                await this.documentosPendientesRepo.save(documento);
                return { exito: true, mensaje: 'Documento autorizado exitosamente' };
            }
            else {
                throw new Error(resultado.error);
            }
        }
        catch (error) {
            documento.estado = 'PENDIENTE';
            documento.ultimo_error = error.message;
            await this.documentosPendientesRepo.save(documento);
            return { exito: false, mensaje: error.message };
        }
    }
};
exports.ContingenciaService = ContingenciaService;
exports.ContingenciaService = ContingenciaService = ContingenciaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(documento_pendiente_sri_entity_1.DocumentoPendienteSRI)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ContingenciaService);
//# sourceMappingURL=contingencia.service.js.map