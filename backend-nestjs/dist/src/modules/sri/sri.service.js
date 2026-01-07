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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SriService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const xml_generator_service_1 = require("./services/xml-generator.service");
const firma_electronica_service_1 = require("./services/firma-electronica.service");
const sri_ws_service_1 = require("./services/sri-ws.service");
const xsd_validation_service_1 = require("./services/xsd-validation.service");
const postgres_queue_service_1 = require("../common/services/postgres-queue.service");
let SriService = class SriService {
    constructor(sriQueue, configService, xmlGeneratorService, firmaElectronicaService, sriWsService, xsdValidationService) {
        this.sriQueue = sriQueue;
        this.configService = configService;
        this.xmlGeneratorService = xmlGeneratorService;
        this.firmaElectronicaService = firmaElectronicaService;
        this.sriWsService = sriWsService;
        this.xsdValidationService = xsdValidationService;
    }
    async enviarFacturaAlSri(data) {
        try {
            const job = await this.sriQueue.addJob('enviar-factura', data);
            return {
                jobId: job.id,
                message: 'Factura agregada a la cola de procesamiento (Postgres)',
            };
        }
        catch (error) {
            console.error('Error al procesar factura SRI:', error);
            throw error;
        }
    }
    async consultarEstadoTarea(jobId) {
        try {
            return { msg: 'Status check not implemented for Postgres Queue yet' };
        }
        catch (error) {
            return { error: 'Error al consultar tarea' };
        }
    }
    async generarXMLFactura(factura) {
        this.xsdValidationService.validarFactura(factura);
        return this.xmlGeneratorService.generarXMLFactura(factura);
    }
    async generarXMLNotaCredito(notaCredito) {
        return this.xmlGeneratorService.generarXMLNotaCredito(notaCredito);
    }
    generarClaveAcceso(factura) {
        return this.xmlGeneratorService.generarClaveAcceso(factura);
    }
    async firmarXML(xmlContent, ruc) {
        let certPath = `./certs/certificado-${ruc}.p12`;
        if (!require('fs').existsSync(certPath)) {
            certPath = this.configService.get('SRI_CERTIFICADO_PATH', './certs/certificado.p12');
        }
        const passwordEncriptada = await this.firmaElectronicaService.obtenerPasswordEncriptada(ruc);
        if (!passwordEncriptada) {
            throw new Error('No se encontró contraseña para el certificado');
        }
        const password = await this.firmaElectronicaService.desencriptarPassword(passwordEncriptada);
        const certificadoInfo = await this.firmaElectronicaService.cargarCertificadoP12(certPath, password, ruc);
        return this.firmaElectronicaService.firmarXML(xmlContent, certificadoInfo);
    }
    async enviarAlSri(xmlContent, ambiente) {
        try {
            const recepcion = await this.sriWsService.enviarRecepcion(xmlContent, ambiente);
            return {
                estado: recepcion.estado,
                mensaje: recepcion.comprobantes?.[0]?.mensajes?.[0]?.mensaje || 'Comprobante recibido',
                mensajes: recepcion.comprobantes?.[0]?.mensajes || [],
            };
        }
        catch (error) {
            throw new Error(`Error al enviar al SRI: ${error.message}`);
        }
    }
    async consultarAutorizacion(claveAcceso, ambiente) {
        try {
            const autorizacion = await this.sriWsService.consultarAutorizacion(claveAcceso, ambiente);
            const primeraAutorizacion = autorizacion.autorizaciones?.[0];
            return {
                autorizado: primeraAutorizacion?.estado === 'AUTORIZADO',
                estado: primeraAutorizacion?.estado || 'NO AUTORIZADO',
                numeroAutorizacion: primeraAutorizacion?.numeroAutorizacion || '',
                fechaAutorizacion: primeraAutorizacion?.fechaAutorizacion || '',
                mensajes: primeraAutorizacion?.mensajes || [],
            };
        }
        catch (error) {
            throw new Error(`Error al consultar autorización: ${error.message}`);
        }
    }
    async enviarYAutorizar(xmlContent, claveAcceso, ambiente) {
        try {
            const resultado = await this.sriWsService.enviarYAutorizar(xmlContent, claveAcceso, ambiente);
            const autorizacion = resultado.autorizacion?.autorizaciones?.[0];
            return {
                recepcion: {
                    estado: resultado.recepcion.estado,
                    mensaje: resultado.recepcion.comprobantes?.[0]?.mensajes?.[0]?.mensaje || '',
                },
                autorizacion: autorizacion ? {
                    autorizado: autorizacion.estado === 'AUTORIZADO',
                    estado: autorizacion.estado,
                    numeroAutorizacion: autorizacion.numeroAutorizacion || '',
                    fechaAutorizacion: autorizacion.fechaAutorizacion || '',
                    comprobante: autorizacion.comprobante || '',
                } : null,
            };
        }
        catch (error) {
            throw new Error(`Error en flujo completo de SRI: ${error.message}`);
        }
    }
    async consultarComprobantesRecibidos(fechaInicio, fechaFin) {
        const cantidad = Math.floor(Math.random() * 10) + 5;
        return this.generarComprobantesMock(cantidad, fechaInicio, fechaFin);
    }
    async consultarConteoPendientes() {
        return { pendientes: Math.floor(Math.random() * 5) + 1 };
    }
    generarComprobantesMock(cantidad, fechaInicioStr, fechaFinStr) {
        const proveedores = [
            { ruc: '1790016919001', razonSocial: 'CORPORACION FAVORITA C.A.' },
            { ruc: '0990017514001', razonSocial: 'TIENDAS INDUSTRIALES ASOCIADAS (TIA) S.A.' },
            { ruc: '1792261621001', razonSocial: 'CONECEL S.A.' },
            { ruc: '1791256115001', razonSocial: 'OTECELL S.A.' },
            { ruc: '1790005542001', razonSocial: 'EMPRESA PUBLICA METROPOLITANA DE AGUA POTABLE' },
            { ruc: '0991327371001', razonSocial: 'CORPORACION EL ROSADO S.A.' },
            { ruc: '1791415132001', razonSocial: 'DINADEC S.A.' },
        ];
        const tipos = [
            { codigo: '01', nombre: 'FACTURA' },
            { codigo: '04', nombre: 'NOTA DE CRÉDITO' },
            { codigo: '07', nombre: 'COMPROBANTE DE RETENCIÓN' },
        ];
        const resultados = [];
        const fechaInicio = new Date(fechaInicioStr);
        const fechaFin = new Date(fechaFinStr);
        for (let i = 0; i < cantidad; i++) {
            const proveedor = proveedores[Math.floor(Math.random() * proveedores.length)];
            const tipo = tipos[Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : 2) : 0];
            const fechaEmision = new Date(fechaInicio.getTime() + Math.random() * (fechaFin.getTime() - fechaInicio.getTime()));
            const fechaEmisionStr = `${fechaEmision.getDate().toString().padStart(2, '0')}/${(fechaEmision.getMonth() + 1).toString().padStart(2, '0')}/${fechaEmision.getFullYear()}`;
            const claveAcceso = this.generarClaveAccesoMock(fechaEmision, tipo.codigo, proveedor.ruc);
            const subtotal = Math.round(Math.random() * 500 * 100) / 100;
            const iva = Math.round(subtotal * 0.15 * 100) / 100;
            const total = subtotal + iva;
            resultados.push({
                claveAcceso,
                rucEmisor: proveedor.ruc,
                razonSocialEmisor: proveedor.razonSocial,
                fechaEmision: fechaEmisionStr,
                fechaAutorizacion: fechaEmisionStr + ' 12:00:00',
                tipoComprobante: tipo.nombre,
                tipoComprobanteCodigo: tipo.codigo,
                numeroComprobante: `001-001-${Math.floor(Math.random() * 1000000).toString().padStart(9, '0')}`,
                serie: '001-001',
                importeTotal: total.toFixed(2),
                xmlUrl: `https://sri.gob.ec/comprobantes/${claveAcceso}.xml`
            });
        }
        return resultados.sort((a, b) => {
            const [da, ma, ya] = a.fechaEmision.split('/');
            const [db, mb, yb] = b.fechaEmision.split('/');
            return new Date(`${yb}-${mb}-${db}`).getTime() - new Date(`${ya}-${ma}-${da}`).getTime();
        }).reverse();
    }
    generarClaveAccesoMock(fecha, tipo, ruc) {
        const fechaStr = `${fecha.getDate().toString().padStart(2, '0')}${(fecha.getMonth() + 1).toString().padStart(2, '0')}${fecha.getFullYear()}`;
        const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        return `${fechaStr}${tipo}${ruc}1${random}123456781`;
    }
};
exports.SriService = SriService;
exports.SriService = SriService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [postgres_queue_service_1.PostgresQueueService,
        config_1.ConfigService,
        xml_generator_service_1.XmlGeneratorService,
        firma_electronica_service_1.FirmaElectronicaService,
        sri_ws_service_1.SriWsService,
        xsd_validation_service_1.XsdValidationService])
], SriService);
//# sourceMappingURL=sri.service.js.map