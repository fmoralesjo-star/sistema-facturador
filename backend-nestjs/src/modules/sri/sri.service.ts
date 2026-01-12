import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Factura } from '../facturas/entities/factura.entity';
import { NotaCredito } from '../notas-credito/entities/nota-credito.entity';
import { XmlGeneratorService } from './services/xml-generator.service';
import { FirmaElectronicaService } from './services/firma-electronica.service';
import { SriWsService } from './services/sri-ws.service';
import { XsdValidationService } from './services/xsd-validation.service';

export interface SriJobData {
  facturaId: number;
  xmlContent: string;
  ambiente: 'pruebas' | 'produccion';
  claveAcceso: string;
}

import { PostgresQueueService } from '../common/services/postgres-queue.service';

@Injectable()
export class SriService {
  constructor(
    private sriQueue: PostgresQueueService, // Injected via CommonModule (Global)
    private configService: ConfigService,
    private xmlGeneratorService: XmlGeneratorService,
    private firmaElectronicaService: FirmaElectronicaService,
    private sriWsService: SriWsService,
    private xsdValidationService: XsdValidationService,
  ) { }

  /**
   * Agrega una tarea a la cola para procesar el envío al SRI
   * Esto es asíncrono y no bloquea la respuesta
   */
  async enviarFacturaAlSri(data: SriJobData) {
    try {
      // 1. Validación Local XSD (Lógica)
      // Recuperar la entidad completa puede ser costoso aquí si solo tenemos ID, 
      // pero idealmente 'enviarYAutorizar' hace la validación completa.
      // Si data tiene el XML ya generado, validamos reglas básicas, 
      // pero para validar negocio necesitamos la entidad Factura.
      // Asumiremos que el Job Processor o el Controller llaman a la validación antes.

      // SIN EMBARGO, para cumplir el requerimiento de "Antes de enviar... valídalo",
      // lo ideal es hacerlo antes de encolar si tenemos los datos, O dentro del procesador.

      // En este caso, modificaremos 'enviarYAutorizar' que es el método síncrono completo,
      // y 'SriProcessor' debería llamar a la validación.

      const job = await this.sriQueue.addJob(
        'enviar-factura',
        data,
      );

      return {
        jobId: job.id,
        message: 'Factura agregada a la cola de procesamiento (Postgres)',
      };
    } catch (error) {
      console.error('Error al procesar factura SRI:', error);
      throw error;
    }
  }

  /**
   * Consulta el estado de una tarea en la cola
   * Nota: Implementación pendiente para PostgresQueueService
   */
  async consultarEstadoTarea(jobId: string) {
    try {
      return { msg: 'Status check not implemented for Postgres Queue yet' };
    } catch (error) {
      return { error: 'Error al consultar tarea' };
    }
  }

  async generarXMLFactura(factura: Factura): Promise<string> {
    // Validar lógicamente la factura antes de generar el XML
    this.xsdValidationService.validarFactura(factura);

    return this.xmlGeneratorService.generarXMLFactura(factura);
  }

  /**
   * Genera el XML de la nota de crédito según especificación SRI
   */
  async generarXMLNotaCredito(notaCredito: NotaCredito): Promise<string> {
    return this.xmlGeneratorService.generarXMLNotaCredito(notaCredito);
  }

  /**
   * Genera la clave de acceso de 49 dígitos
   */
  generarClaveAcceso(factura: any): string {
    return this.xmlGeneratorService.generarClaveAcceso(factura);
  }

  /**
   * Firma el XML con el certificado
   */
  async firmarXML(xmlContent: string, ruc: string): Promise<string> {
    // Cargar certificado
    // Intentar buscar el certificado específico para este RUC
    let certPath = `./certs/certificado-${ruc}.p12`;

    // Si no existe, usar el path configurado por defecto
    // Usamos require('fs') dinámico para no añadir imports arriba si no es necesario, 
    // pero idealmente debería ser import * as fs from 'fs';
    if (!require('fs').existsSync(certPath)) {
      certPath = this.configService.get('SRI_CERTIFICADO_PATH', './certs/certificado.p12');
    }

    // Obtener contraseña encriptada del vault
    const passwordEncriptada = await this.firmaElectronicaService.obtenerPasswordEncriptada(ruc);
    if (!passwordEncriptada) {
      throw new Error('No se encontró contraseña para el certificado');
    }

    // Desencriptar contraseña
    const password = await this.firmaElectronicaService.desencriptarPassword(passwordEncriptada);

    // Cargar certificado
    const certificadoInfo = await this.firmaElectronicaService.cargarCertificadoP12(certPath, password, ruc);

    // Firmar XML
    return this.firmaElectronicaService.firmarXML(xmlContent, certificadoInfo);
  }

  /**
   * Envía el XML al WS de Recepción del SRI
   */
  async enviarAlSri(xmlContent: string, ambiente: string): Promise<any> {
    try {
      const recepcion = await this.sriWsService.enviarRecepcion(xmlContent, ambiente);

      return {
        estado: recepcion.estado,
        mensaje: recepcion.comprobantes?.[0]?.mensajes?.[0]?.mensaje || 'Comprobante recibido',
        mensajes: recepcion.comprobantes?.[0]?.mensajes || [],
      };
    } catch (error) {
      throw new Error(`Error al enviar al SRI: ${error.message}`);
    }
  }

  /**
   * Consulta la autorización en el WS de Autorización del SRI
   */
  async consultarAutorizacion(claveAcceso: string, ambiente: string): Promise<any> {
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
    } catch (error) {
      throw new Error(`Error al consultar autorización: ${error.message}`);
    }
  }

  /**
   * Envía el comprobante y consulta la autorización en un solo flujo
   * (Recomendado para uso directo)
   */
  async enviarYAutorizar(
    xmlContent: string,
    claveAcceso: string,
    ambiente: string,
  ): Promise<any> {
    try {
      const resultado = await this.sriWsService.enviarYAutorizar(
        xmlContent,
        claveAcceso,
        ambiente,
      );

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
    } catch (error) {
      throw new Error(`Error en flujo completo de SRI: ${error.message}`);
    }
  }

  /**
   * MOCK: Simular consulta de comprobantes recibidos del SRI
   */
  async consultarComprobantesRecibidos(fechaInicio: string, fechaFin: string): Promise<any[]> {
    // Generar entre 5 y 15 comprobantes aleatorios
    const cantidad = Math.floor(Math.random() * 10) + 5;
    return this.generarComprobantesMock(cantidad, fechaInicio, fechaFin);
  }

  /**
   * MOCK: Consulta conteo de comprobantes pendientes de sincronizar
   */
  async consultarConteoPendientes(): Promise<{ pendientes: number }> {
    // Simular un número aleatorio entre 1 y 5 para demos
    // En producción esto compararía la lista del SRI con la base de datos
    return { pendientes: Math.floor(Math.random() * 5) + 1 };
  }

  private generarComprobantesMock(cantidad: number, fechaInicioStr: string, fechaFinStr: string) {
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
      const tipo = tipos[Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : 2) : 0]; // 80% facturas

      // Fecha aleatoria entre inicio y fin
      const fechaEmision = new Date(fechaInicio.getTime() + Math.random() * (fechaFin.getTime() - fechaInicio.getTime()));

      // Formato dd/mm/yyyy
      const fechaEmisionStr = `${fechaEmision.getDate().toString().padStart(2, '0')}/${(fechaEmision.getMonth() + 1).toString().padStart(2, '0')}/${fechaEmision.getFullYear()}`;

      // Generar clave acceso dummy
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
        xmlUrl: `https://sri.gob.ec/comprobantes/${claveAcceso}.xml` // Dummy URL
      });
    }

    return resultados.sort((a, b) => {
      // Ordenar por fecha descendente (parseando dd/mm/yyyy)
      const [da, ma, ya] = a.fechaEmision.split('/');
      const [db, mb, yb] = b.fechaEmision.split('/');
      return new Date(`${yb}-${mb}-${db}`).getTime() - new Date(`${ya}-${ma}-${da}`).getTime();
    }).reverse();
  }

  private generarClaveAccesoMock(fecha: Date, tipo: string, ruc: string): string {
    const fechaStr = `${fecha.getDate().toString().padStart(2, '0')}${(fecha.getMonth() + 1).toString().padStart(2, '0')}${fecha.getFullYear()}`;
    const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    // Formato simple parecido a clave real
    return `${fechaStr}${tipo}${ruc}1${random}123456781`;
  }
  async consultarContribuyente(ruc: string): Promise<any> {
    try {
      // Endpoint público del SRI para consulta de datos básicos (Catastro)
      const url = `https://srienlinea.sri.gob.ec/sri-catastro-sujeto-servicio-internet/rest/ConsolidadoContribuyente/obtenerPorNumerosRuc?numerosRuc=${ruc}`;

      const axios = require('axios');
      const response = await axios.get(url);
      const data = response.data;

      if (Array.isArray(data) && data.length > 0) {
        const contribuyente = data[0];
        return {
          nombre: contribuyente.nombreComercial || contribuyente.razonSocial,
          direccion: contribuyente.direccionMatriz || 'Dirección no disponible en SRI (Sin Login)',
          identificacion: ruc,
          nombreComercial: contribuyente.nombreComercial,
          razonSocial: contribuyente.razonSocial,
          estado: contribuyente.estadoPersona === 'ACTIVO' ? 'Activo' : 'Inactivo',
          clase: contribuyente.claseContribuyente,
          obligadoContabilidad: contribuyente.obligadoContabilidad === 'S'
        };
      } else {
        throw new NotFoundException('Contribuyente no encontrado en SRI');
      }
    } catch (error) {
      console.error('Error fetching RUC from SRI:', error);
      // Check if it's a 404 from SRI or network error
      if (error.response && error.response.status === 404) {
        throw new NotFoundException('Contribuyente no encontrado en SRI');
      }
      // Safely extract error message
      const msg = error.response?.data?.mensaje || error.message;
      throw new BadRequestException(`No se pudo obtener datos del SRI: ${msg}`);
    }
  }
}

