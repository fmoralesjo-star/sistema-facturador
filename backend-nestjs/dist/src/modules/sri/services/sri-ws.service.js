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
var SriWsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SriWsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const soap = require("soap");
let SriWsService = SriWsService_1 = class SriWsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SriWsService_1.name);
        this.WS_RECEPCION_PRUEBAS = 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl';
        this.WS_AUTORIZACION_PRUEBAS = 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl';
        this.WS_RECEPCION_PRODUCCION = 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl';
        this.WS_AUTORIZACION_PRODUCCION = 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl';
    }
    getRecepcionUrl(ambiente) {
        return ambiente === 'produccion'
            ? this.WS_RECEPCION_PRODUCCION
            : this.WS_RECEPCION_PRUEBAS;
    }
    getAutorizacionUrl(ambiente) {
        return ambiente === 'produccion'
            ? this.WS_AUTORIZACION_PRODUCCION
            : this.WS_AUTORIZACION_PRUEBAS;
    }
    async enviarRecepcion(xmlFirmado, ambiente) {
        try {
            const wsdlUrl = this.getRecepcionUrl(ambiente);
            this.logger.log(`Enviando comprobante al WS de Recepción (${ambiente}): ${wsdlUrl}`);
            const client = await soap.createClientAsync(wsdlUrl, {
                wsdl_options: {
                    rejectUnauthorized: false,
                },
            });
            const xmlBase64 = Buffer.from(xmlFirmado, 'utf-8').toString('base64');
            const args = {
                xml: xmlBase64,
            };
            const [result] = await client.validarComprobanteAsync(args);
            this.logger.log('Respuesta del WS de Recepción recibida');
            const respuesta = result.RespuestaRecepcionComprobante;
            if (!respuesta) {
                throw new Error('Respuesta inválida del WS de Recepción');
            }
            const estado = respuesta.estado || 'ERROR';
            const mensajes = respuesta.comprobantes?.comprobante?.[0]?.mensajes?.mensaje || [];
            const response = {
                estado,
                comprobantes: respuesta.comprobantes?.comprobante?.map((comp) => ({
                    claveAcceso: comp.claveAcceso || '',
                    mensajes: comp.mensajes?.mensaje?.map((msg) => ({
                        identificador: msg.identificador || '',
                        mensaje: msg.mensaje || '',
                        informacionAdicional: msg.informacionAdicional || '',
                        tipo: msg.tipo || '',
                    })) || [],
                })) || [],
            };
            this.logger.log(`Estado de recepción: ${estado}`);
            return response;
        }
        catch (error) {
            this.logger.error('Error al enviar al WS de Recepción:', error);
            throw new Error(`Error al enviar al WS de Recepción: ${error.message}`);
        }
    }
    async consultarAutorizacion(claveAcceso, ambiente) {
        try {
            const wsdlUrl = this.getAutorizacionUrl(ambiente);
            this.logger.log(`Consultando autorización en WS de Autorización (${ambiente}): ${wsdlUrl}`);
            const client = await soap.createClientAsync(wsdlUrl, {
                wsdl_options: {
                    rejectUnauthorized: false,
                },
            });
            const args = {
                claveAccesoComprobante: claveAcceso,
            };
            const [result] = await client.autorizacionComprobanteAsync(args);
            this.logger.log('Respuesta del WS de Autorización recibida');
            const respuesta = result.RespuestaAutorizacionComprobante;
            if (!respuesta) {
                throw new Error('Respuesta inválida del WS de Autorización');
            }
            const autorizaciones = respuesta.autorizaciones?.autorizacion || [];
            const response = {
                autorizaciones: autorizaciones.map((auth) => ({
                    estado: auth.estado || '',
                    numeroAutorizacion: auth.numeroAutorizacion || '',
                    fechaAutorizacion: auth.fechaAutorizacion || '',
                    ambiente: auth.ambiente || '',
                    comprobante: auth.comprobante || '',
                    mensajes: auth.mensajes?.mensaje?.map((msg) => ({
                        identificador: msg.identificador || '',
                        mensaje: msg.mensaje || '',
                        informacionAdicional: msg.informacionAdicional || '',
                        tipo: msg.tipo || '',
                    })) || [],
                })),
            };
            if (autorizaciones.length > 0) {
                this.logger.log(`Estado de autorización: ${response.autorizaciones[0].estado}`);
            }
            return response;
        }
        catch (error) {
            this.logger.error('Error al consultar autorización:', error);
            throw new Error(`Error al consultar autorización: ${error.message}`);
        }
    }
    async enviarYAutorizar(xmlFirmado, claveAcceso, ambiente) {
        try {
            this.logger.log('Paso 1: Enviando comprobante al WS de Recepción');
            const recepcion = await this.enviarRecepcion(xmlFirmado, ambiente);
            if (recepcion.estado === 'RECIBIDA') {
                this.logger.log('Estado RECIBIDA. Esperando 3 segundos antes de consultar autorización...');
                await new Promise(resolve => setTimeout(resolve, 3000));
                this.logger.log('Paso 2: Consultando autorización en WS de Autorización');
                const autorizacion = await this.consultarAutorizacion(claveAcceso, ambiente);
                return {
                    recepcion,
                    autorizacion,
                };
            }
            this.logger.warn(`Estado no es RECIBIDA (${recepcion.estado}), no se consultará autorización`);
            return {
                recepcion,
            };
        }
        catch (error) {
            this.logger.error('Error en flujo de envío y autorización:', error);
            throw error;
        }
    }
};
exports.SriWsService = SriWsService;
exports.SriWsService = SriWsService = SriWsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SriWsService);
//# sourceMappingURL=sri-ws.service.js.map