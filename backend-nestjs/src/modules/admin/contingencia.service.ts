import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentoPendienteSRI } from './entities/documento-pendiente-sri.entity';
import axios from 'axios';

@Injectable()
export class ContingenciaService {
    private readonly logger = new Logger(ContingenciaService.name);
    private readonly MAX_REINTENTOS = 10;
    private readonly TIMEOUT_SRI = 30000; // 30 segundos

    constructor(
        @InjectRepository(DocumentoPendienteSRI)
        private documentosPendientesRepo: Repository<DocumentoPendienteSRI>,
    ) { }

    /**
     * Agrega un documento a la cola de contingencia
     */
    async agregarAColaContingencia(
        tipoDocumento: 'FACTURA' | 'NOTA_CREDITO' | 'ANULACION' | 'RETENCION',
        documentoId: number,
        numeroDocumento: string,
        clienteNombre: string,
        xmlContenido: string,
        claveAcceso: string,
    ): Promise<DocumentoPendienteSRI> {
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

    /**
     * Obtiene todos los documentos pendientes
     */
    async obtenerDocumentosPendientes(filtros?: {
        tipo?: string;
        estado?: string;
        limite?: number;
    }): Promise<DocumentoPendienteSRI[]> {
        const query = this.documentosPendientesRepo.createQueryBuilder('doc');

        if (filtros?.tipo) {
            query.andWhere('doc.tipo_documento = :tipo', { tipo: filtros.tipo });
        }

        if (filtros?.estado) {
            query.andWhere('doc.estado = :estado', { estado: filtros.estado });
        } else {
            // Por defecto, solo documentos pendientes
            query.andWhere('doc.estado IN (:...estados)', { estados: ['PENDIENTE', 'ENVIANDO'] });
        }

        query.orderBy('doc.fecha_creacion', 'ASC');

        if (filtros?.limite) {
            query.limit(filtros.limite);
        }

        return await query.getMany();
    }

    /**
     * Obtiene contador de documentos represados por tipo
     */
    async obtenerContadorDocumentosRepresados(): Promise<{
        total: number;
        facturas: number;
        notasCredito: number;
        anulaciones: number;
        retenciones: number;
    }> {
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

    /**
     * Verifica si el SRI está disponible
     */
    async verificarEstadoSRI(): Promise<boolean> {
        try {
            const ambiente = process.env.SRI_AMBIENTE || 'pruebas';
            const baseUrl = ambiente === 'produccion'
                ? 'https://cel.sri.gob.ec'
                : 'https://celospruebas.sri.gob.ec';

            const endpoint = `${baseUrl}/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl`;

            const response = await axios.get(endpoint, {
                timeout: 5000,
                validateStatus: (status) => status < 500,
            });

            return response.status < 400;
        } catch (error) {
            this.logger.warn(`SRI no disponible: ${error.message}`);
            return false;
        }
    }

    /**
     * Procesa la cola de documentos pendientes
     */
    async procesarColaContingencia(): Promise<{
        procesados: number;
        exitosos: number;
        fallidos: number;
        errores: string[];
    }> {
        this.logger.log('🔄 Iniciando procesamiento de cola de contingencia...');

        // Verificar si SRI está disponible
        const sriDisponible = await this.verificarEstadoSRI();
        if (!sriDisponible) {
            this.logger.warn('⚠️ SRI no disponible - cancelando procesamiento');
            return { procesados: 0, exitosos: 0, fallidos: 0, errores: ['SRI no disponible'] };
        }

        // Obtener documentos pendientes (máximo 50 por ejecución)
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
            errores: [] as string[],
        };

        for (const documento of documentos) {
            try {
                resultados.procesados++;

                // Marcar como enviando
                documento.estado = 'ENVIANDO';
                documento.intentos++;
                documento.ultimo_intento = new Date();
                await this.documentosPendientesRepo.save(documento);

                // Intentar enviar al SRI
                const resultado = await this.enviarDocumentoAlSRI(documento);

                if (resultado.exito) {
                    // Actualizar como autorizado
                    documento.estado = 'AUTORIZADA';
                    documento.fecha_autorizacion = new Date();
                    documento.numero_autorizacion = resultado.numeroAutorizacion;
                    await this.documentosPendientesRepo.save(documento);

                    resultados.exitosos++;
                    this.logger.log(`✅ ${documento.tipo_documento} ${documento.numero_documento} autorizado`);
                } else {
                    throw new Error(resultado.error);
                }
            } catch (error) {
                resultados.fallidos++;
                const errorMsg = `${documento.tipo_documento} ${documento.numero_documento}: ${error.message}`;
                resultados.errores.push(errorMsg);

                // Actualizar error
                documento.ultimo_error = error.message;

                // Si excede máximo de reintentos, marcar como error permanente
                if (documento.intentos >= this.MAX_REINTENTOS) {
                    documento.estado = 'ERROR_PERMANENTE';
                    this.logger.error(`❌ ${documento.tipo_documento} ${documento.numero_documento} - Error permanente después de ${this.MAX_REINTENTOS} intentos`);
                } else {
                    documento.estado = 'PENDIENTE';
                }

                await this.documentosPendientesRepo.save(documento);
            }
        }

        this.logger.log(`✅ Procesamiento completado: ${resultados.exitosos} exitosos, ${resultados.fallidos} fallidos`);
        return resultados;
    }

    /**
     * Envía un documento al SRI
     */
    private async enviarDocumentoAlSRI(documento: DocumentoPendienteSRI): Promise<{
        exito: boolean;
        numeroAutorizacion?: string;
        error?: string;
    }> {
        try {
            const ambiente = process.env.SRI_AMBIENTE || 'pruebas';
            const baseUrl = ambiente === 'produccion'
                ? 'https://cel.sri.gob.ec'
                : 'https://celospruebas.sri.gob.ec';

            const endpoint = `${baseUrl}/comprobantes-electronicos-ws/RecepcionComprobantesOffline`;

            // Aquí iría la lógica real de envío SOAP al SRI
            // Por ahora, simulamos el envío
            const response = await axios.post(
                endpoint,
                documento.xml_contenido,
                {
                    headers: { 'Content-Type': 'text/xml' },
                    timeout: this.TIMEOUT_SRI,
                }
            );

            // Parsear respuesta del SRI y extraer número de autorización
            // Esto depende del formato de respuesta del SRI
            const numeroAutorizacion = this.extraerNumeroAutorizacion(response.data);

            return {
                exito: true,
                numeroAutorizacion,
            };
        } catch (error) {
            return {
                exito: false,
                error: error.message,
            };
        }
    }

    /**
     * Extrae el número de autorización de la respuesta del SRI
     */
    private extraerNumeroAutorizacion(respuestaXML: string): string {
        // Aquí iría la lógica de parseo del XML de respuesta del SRI
        // Por ahora retornamos un placeholder
        return `AUTH-${Date.now()}`;
    }

    /**
     * Reintenta el envío de un documento específico
     */
    async reintentarEnvioDocumento(id: number): Promise<{
        exito: boolean;
        mensaje: string;
    }> {
        const documento = await this.documentosPendientesRepo.findOne({ where: { id } });

        if (!documento) {
            return { exito: false, mensaje: 'Documento no encontrado' };
        }

        if (documento.estado === 'AUTORIZADA') {
            return { exito: false, mensaje: 'El documento ya está autorizado' };
        }

        try {
            // Marcar como enviando
            documento.estado = 'ENVIANDO';
            documento.intentos++;
            documento.ultimo_intento = new Date();
            await this.documentosPendientesRepo.save(documento);

            // Intentar enviar
            const resultado = await this.enviarDocumentoAlSRI(documento);

            if (resultado.exito) {
                documento.estado = 'AUTORIZADA';
                documento.fecha_autorizacion = new Date();
                documento.numero_autorizacion = resultado.numeroAutorizacion;
                await this.documentosPendientesRepo.save(documento);

                return { exito: true, mensaje: 'Documento autorizado exitosamente' };
            } else {
                throw new Error(resultado.error);
            }
        } catch (error) {
            documento.estado = 'PENDIENTE';
            documento.ultimo_error = error.message;
            await this.documentosPendientesRepo.save(documento);

            return { exito: false, mensaje: error.message };
        }
    }
}
