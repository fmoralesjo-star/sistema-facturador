import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as soap from 'soap';

export interface RecepcionResponse {
  estado: string;
  comprobantes?: Array<{
    claveAcceso: string;
    mensajes?: Array<{
      identificador: string;
      mensaje: string;
      informacionAdicional?: string;
      tipo: string;
    }>;
  }>;
}

export interface AutorizacionResponse {
  autorizaciones?: Array<{
    estado: string;
    numeroAutorizacion?: string;
    fechaAutorizacion?: string;
    ambiente?: string;
    comprobante?: string;
    mensajes?: Array<{
      identificador: string;
      mensaje: string;
      informacionAdicional?: string;
      tipo: string;
    }>;
  }>;
}

@Injectable()
export class SriWsService {
  private readonly logger = new Logger(SriWsService.name);

  // URLs de los Web Services del SRI
  private readonly WS_RECEPCION_PRUEBAS = 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl';
  private readonly WS_AUTORIZACION_PRUEBAS = 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl';
  
  private readonly WS_RECEPCION_PRODUCCION = 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl';
  private readonly WS_AUTORIZACION_PRODUCCION = 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl';

  constructor(private configService: ConfigService) {}

  /**
   * Obtiene la URL del WS de Recepción según el ambiente
   */
  private getRecepcionUrl(ambiente: string): string {
    return ambiente === 'produccion' 
      ? this.WS_RECEPCION_PRODUCCION 
      : this.WS_RECEPCION_PRUEBAS;
  }

  /**
   * Obtiene la URL del WS de Autorización según el ambiente
   */
  private getAutorizacionUrl(ambiente: string): string {
    return ambiente === 'produccion'
      ? this.WS_AUTORIZACION_PRODUCCION
      : this.WS_AUTORIZACION_PRUEBAS;
  }

  /**
   * Envía el XML firmado al WS de Recepción del SRI
   * @param xmlFirmado XML firmado con XAdES-BES
   * @param ambiente Ambiente ('pruebas' o 'produccion')
   * @returns Respuesta del WS de Recepción
   */
  async enviarRecepcion(xmlFirmado: string, ambiente: string): Promise<RecepcionResponse> {
    try {
      const wsdlUrl = this.getRecepcionUrl(ambiente);
      this.logger.log(`Enviando comprobante al WS de Recepción (${ambiente}): ${wsdlUrl}`);

      // Crear cliente SOAP
      const client = await soap.createClientAsync(wsdlUrl, {
        // Configuración para ignorar errores SSL (solo para desarrollo)
        // En producción, usar certificados válidos
        wsdl_options: {
          rejectUnauthorized: false, // Solo para desarrollo/pruebas
        },
      });

      // Base64 del XML
      const xmlBase64 = Buffer.from(xmlFirmado, 'utf-8').toString('base64');

      // Parámetros para el método validarComprobante
      const args = {
        xml: xmlBase64,
      };

      // Llamar al método validarComprobante
      const [result] = await client.validarComprobanteAsync(args);

      this.logger.log('Respuesta del WS de Recepción recibida');

      // Procesar respuesta
      const respuesta = result.RespuestaRecepcionComprobante;

      if (!respuesta) {
        throw new Error('Respuesta inválida del WS de Recepción');
      }

      // Extraer estado
      const estado = respuesta.estado || 'ERROR';

      // Extraer mensajes si existen
      const mensajes = respuesta.comprobantes?.comprobante?.[0]?.mensajes?.mensaje || [];

      const response: RecepcionResponse = {
        estado,
        comprobantes: respuesta.comprobantes?.comprobante?.map((comp: any) => ({
          claveAcceso: comp.claveAcceso || '',
          mensajes: comp.mensajes?.mensaje?.map((msg: any) => ({
            identificador: msg.identificador || '',
            mensaje: msg.mensaje || '',
            informacionAdicional: msg.informacionAdicional || '',
            tipo: msg.tipo || '',
          })) || [],
        })) || [],
      };

      this.logger.log(`Estado de recepción: ${estado}`);

      return response;
    } catch (error) {
      this.logger.error('Error al enviar al WS de Recepción:', error);
      throw new Error(`Error al enviar al WS de Recepción: ${error.message}`);
    }
  }

  /**
   * Consulta la autorización de un comprobante en el WS de Autorización del SRI
   * @param claveAcceso Clave de acceso de 49 dígitos
   * @param ambiente Ambiente ('pruebas' o 'produccion')
   * @returns Respuesta del WS de Autorización
   */
  async consultarAutorizacion(claveAcceso: string, ambiente: string): Promise<AutorizacionResponse> {
    try {
      const wsdlUrl = this.getAutorizacionUrl(ambiente);
      this.logger.log(`Consultando autorización en WS de Autorización (${ambiente}): ${wsdlUrl}`);

      // Crear cliente SOAP
      const client = await soap.createClientAsync(wsdlUrl, {
        wsdl_options: {
          rejectUnauthorized: false, // Solo para desarrollo/pruebas
        },
      });

      // Parámetros para el método autorizacionComprobante
      const args = {
        claveAccesoComprobante: claveAcceso,
      };

      // Llamar al método autorizacionComprobante
      const [result] = await client.autorizacionComprobanteAsync(args);

      this.logger.log('Respuesta del WS de Autorización recibida');

      // Procesar respuesta
      const respuesta = result.RespuestaAutorizacionComprobante;

      if (!respuesta) {
        throw new Error('Respuesta inválida del WS de Autorización');
      }

      // Procesar autorizaciones
      const autorizaciones = respuesta.autorizaciones?.autorizacion || [];

      const response: AutorizacionResponse = {
        autorizaciones: autorizaciones.map((auth: any) => ({
          estado: auth.estado || '',
          numeroAutorizacion: auth.numeroAutorizacion || '',
          fechaAutorizacion: auth.fechaAutorizacion || '',
          ambiente: auth.ambiente || '',
          comprobante: auth.comprobante || '',
          mensajes: auth.mensajes?.mensaje?.map((msg: any) => ({
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
    } catch (error) {
      this.logger.error('Error al consultar autorización:', error);
      throw new Error(`Error al consultar autorización: ${error.message}`);
    }
  }

  /**
   * Envía el comprobante y consulta la autorización automáticamente
   * Espera 2-3 segundos si el estado es RECIBIDA antes de consultar
   * @param xmlFirmado XML firmado con XAdES-BES
   * @param claveAcceso Clave de acceso de 49 dígitos
   * @param ambiente Ambiente ('pruebas' o 'produccion')
   * @returns Respuesta completa con recepción y autorización
   */
  async enviarYAutorizar(
    xmlFirmado: string,
    claveAcceso: string,
    ambiente: string,
  ): Promise<{
    recepcion: RecepcionResponse;
    autorizacion?: AutorizacionResponse;
  }> {
    try {
      // Paso 1: Enviar a Recepción
      this.logger.log('Paso 1: Enviando comprobante al WS de Recepción');
      const recepcion = await this.enviarRecepcion(xmlFirmado, ambiente);

      // Paso 2: Si el estado es RECIBIDA, esperar y consultar autorización
      if (recepcion.estado === 'RECIBIDA') {
        this.logger.log('Estado RECIBIDA. Esperando 3 segundos antes de consultar autorización...');
        
        // Esperar 3 segundos (como recomienda el SRI)
        await new Promise(resolve => setTimeout(resolve, 3000));

        this.logger.log('Paso 2: Consultando autorización en WS de Autorización');
        const autorizacion = await this.consultarAutorizacion(claveAcceso, ambiente);

        return {
          recepcion,
          autorizacion,
        };
      }

      // Si no es RECIBIDA, retornar solo recepción
      this.logger.warn(`Estado no es RECIBIDA (${recepcion.estado}), no se consultará autorización`);
      
      return {
        recepcion,
      };
    } catch (error) {
      this.logger.error('Error en flujo de envío y autorización:', error);
      throw error;
    }
  }
}

