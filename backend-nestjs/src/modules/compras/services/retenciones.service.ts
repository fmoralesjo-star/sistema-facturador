import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ComprobanteRetencion } from '../entities/comprobante-retencion.entity';
import { Compra } from '../entities/compra.entity';
import { Empresa } from '../../empresa/entities/empresa.entity';
import { SriService } from '../../sri/sri.service';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RetencionesService {
    private readonly logger = new Logger(RetencionesService.name);
    private readonly ambiente: string;
    private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'retenciones');

    constructor(
        @InjectRepository(ComprobanteRetencion)
        private retencionRepository: Repository<ComprobanteRetencion>,
        private dataSource: DataSource,
        private configService: ConfigService,
        private sriService: SriService,
    ) {
        this.ambiente = this.configService.get('SRI_AMBIENTE', 'pruebas');
        // Asegurar que el directorio existe
        if (!fs.existsSync(this.uploadsDir)) {
            fs.mkdirSync(this.uploadsDir, { recursive: true });
        }
    }

    /**
     * Emite un comprobante de retención para una compra
     * Flujo completo: Generar XML -> Firmar -> Enviar SRI -> Autorizar -> PDF
     */
    async emitirRetencion(compra: Compra): Promise<ComprobanteRetencion> {
        this.logger.log(`Iniciando emisión de retención para compra ${compra.id}`);

        // Verificar si ya existe una retención para esta compra
        const existente = await this.retencionRepository.findOne({
            where: { compra_id: compra.id }
        });

        if (existente && existente.estado === 'AUTORIZADO') {
            this.logger.warn(`Ya existe una retención autorizada para la compra ${compra.id}`);
            return existente;
        }

        // Obtener datos de la empresa emisora
        const empresa = await this.dataSource.getRepository(Empresa).findOne({
            where: { activa: true }
        });

        if (!empresa) {
            throw new Error('No se encontró empresa activa para emitir retención');
        }

        // Obtener siguiente secuencial
        const secuencial = await this.obtenerSiguienteSecuencial(empresa);

        // Crear registro de retención
        const retencion = this.retencionRepository.create({
            compra_id: compra.id,
            establecimiento: empresa.codigo_establecimiento || '001',
            punto_emision: empresa.punto_emision || '001',
            secuencial: secuencial,
            fecha_emision: new Date(),
            proveedor_id: compra.proveedor_id,
            ruc_proveedor: compra.proveedor?.ruc || '',
            razon_social_proveedor: compra.proveedor?.nombre || '',
            codigo_sustento: '01', // Factura
            tipo_doc_sustento: '01',
            numero_doc_sustento: compra.numero,
            fecha_doc_sustento: compra.fecha,
            retencion_renta_codigo: compra.retencion_renta_codigo,
            retencion_renta_porcentaje: compra.retencion_renta_porcentaje,
            retencion_renta_base: compra.subtotal,
            retencion_renta_valor: compra.retencion_renta_valor,
            retencion_iva_codigo: compra.retencion_iva_codigo,
            retencion_iva_porcentaje: compra.retencion_iva_porcentaje,
            retencion_iva_base: compra.impuesto,
            retencion_iva_valor: compra.retencion_iva_valor,
            total_retenido: Number(compra.retencion_renta_valor || 0) + Number(compra.retencion_iva_valor || 0),
            estado: 'GENERADO',
        });

        // Generar clave de acceso
        retencion.clave_acceso = this.generarClaveAcceso(retencion, empresa);

        // Guardar registro inicial
        await this.retencionRepository.save(retencion);

        try {
            // 1. Generar XML
            this.logger.log('Generando XML de retención...');
            const xmlGenerado = await this.generarXMLRetencion(retencion, empresa);
            retencion.xml_generado = xmlGenerado;
            await this.retencionRepository.save(retencion);

            // 2. Firmar XML
            this.logger.log('Firmando XML...');
            const xmlFirmado = await this.sriService.firmarXML(xmlGenerado, empresa.ruc);
            retencion.xml_firmado = xmlFirmado;
            retencion.estado = 'FIRMADO';
            await this.retencionRepository.save(retencion);

            // 3. Enviar al SRI y autorizar
            this.logger.log('Enviando al SRI...');
            const resultado = await this.sriService.enviarYAutorizar(
                xmlFirmado,
                retencion.clave_acceso,
                this.ambiente
            );

            retencion.estado = 'ENVIADO';
            retencion.mensajes_sri = resultado;

            if (resultado.autorizacion?.autorizado) {
                retencion.estado = 'AUTORIZADO';
                retencion.numero_autorizacion = resultado.autorizacion.numeroAutorizacion || retencion.clave_acceso;
                retencion.fecha_autorizacion = resultado.autorizacion.fechaAutorizacion
                    ? new Date(resultado.autorizacion.fechaAutorizacion)
                    : new Date();
                retencion.xml_autorizado = resultado.autorizacion.comprobante || xmlFirmado;

                this.logger.log(`Retención autorizada: ${retencion.numero_autorizacion}`);

                // 4. Generar PDF
                try {
                    const pdfPath = await this.generarPDFRetencion(retencion, empresa);
                    retencion.pdf_path = pdfPath;
                } catch (pdfError) {
                    this.logger.error('Error al generar PDF:', pdfError);
                }
            } else {
                retencion.estado = 'RECHAZADO';
                retencion.error_message = JSON.stringify(resultado.autorizacion?.mensajes || resultado.recepcion?.mensaje);
                this.logger.warn(`Retención rechazada: ${retencion.error_message}`);
            }

            await this.retencionRepository.save(retencion);
            return retencion;

        } catch (error) {
            this.logger.error(`Error en emisión de retención: ${error.message}`);
            retencion.estado = 'ERROR';
            retencion.error_message = error.message;
            await this.retencionRepository.save(retencion);
            throw error;
        }
    }

    /**
     * Genera el XML de retención según esquema SRI v2.0.0
     */
    private async generarXMLRetencion(retencion: ComprobanteRetencion, empresa: Empresa): Promise<string> {
        const fechaEmision = this.formatearFecha(retencion.fecha_emision);
        const fechaDocSustento = this.formatearFecha(retencion.fecha_doc_sustento);

        // Construir retenciones
        let retencionesXML = '';

        // Retención de Renta (código 1)
        if (retencion.retencion_renta_valor && Number(retencion.retencion_renta_valor) > 0) {
            retencionesXML += `
                <retencion>
                    <codigo>1</codigo>
                    <codigoRetencion>${this.escapeXML(retencion.retencion_renta_codigo || '312')}</codigoRetencion>
                    <baseImponible>${Number(retencion.retencion_renta_base).toFixed(2)}</baseImponible>
                    <porcentajeRetener>${Number(retencion.retencion_renta_porcentaje).toFixed(2)}</porcentajeRetener>
                    <valorRetenido>${Number(retencion.retencion_renta_valor).toFixed(2)}</valorRetenido>
                </retencion>`;
        }

        // Retención de IVA (código 2)
        if (retencion.retencion_iva_valor && Number(retencion.retencion_iva_valor) > 0) {
            retencionesXML += `
                <retencion>
                    <codigo>2</codigo>
                    <codigoRetencion>${this.escapeXML(retencion.retencion_iva_codigo || '9')}</codigoRetencion>
                    <baseImponible>${Number(retencion.retencion_iva_base).toFixed(2)}</baseImponible>
                    <porcentajeRetener>${Number(retencion.retencion_iva_porcentaje).toFixed(2)}</porcentajeRetener>
                    <valorRetenido>${Number(retencion.retencion_iva_valor).toFixed(2)}</valorRetenido>
                </retencion>`;
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<comprobanteRetencion id="comprobante" version="2.0.0">
    <infoTributaria>
        <ambiente>${this.ambiente === 'produccion' ? '2' : '1'}</ambiente>
        <tipoEmision>1</tipoEmision>
        <razonSocial>${this.escapeXML(empresa.razon_social)}</razonSocial>
        <nombreComercial>${this.escapeXML(empresa.nombre_comercial || empresa.razon_social)}</nombreComercial>
        <ruc>${empresa.ruc}</ruc>
        <claveAcceso>${retencion.clave_acceso}</claveAcceso>
        <codDoc>07</codDoc>
        <estab>${retencion.establecimiento}</estab>
        <ptoEmi>${retencion.punto_emision}</ptoEmi>
        <secuencial>${retencion.secuencial}</secuencial>
        <dirMatriz>${this.escapeXML(empresa.direccion_matriz)}</dirMatriz>
    </infoTributaria>
    <infoCompRetencion>
        <fechaEmision>${fechaEmision}</fechaEmision>
        <dirEstablecimiento>${this.escapeXML(empresa.direccion_establecimiento || empresa.direccion_matriz)}</dirEstablecimiento>
        <contribuyenteEspecial>${empresa.contribuyente_especial || ''}</contribuyenteEspecial>
        <obligadoContabilidad>${empresa.obligado_contabilidad ? 'SI' : 'NO'}</obligadoContabilidad>
        <tipoIdentificacionSujetoRetenido>${retencion.ruc_proveedor?.length === 13 ? '04' : '05'}</tipoIdentificacionSujetoRetenido>
        <parteRel>NO</parteRel>
        <razonSocialSujetoRetenido>${this.escapeXML(retencion.razon_social_proveedor)}</razonSocialSujetoRetenido>
        <identificacionSujetoRetenido>${retencion.ruc_proveedor}</identificacionSujetoRetenido>
        <periodoFiscal>${this.obtenerPeriodoFiscal(retencion.fecha_emision)}</periodoFiscal>
    </infoCompRetencion>
    <docsSustento>
        <docSustento>
            <codSustento>${retencion.codigo_sustento}</codSustento>
            <codDocSustento>${retencion.tipo_doc_sustento}</codDocSustento>
            <numDocSustento>${retencion.numero_doc_sustento}</numDocSustento>
            <fechaEmisionDocSustento>${fechaDocSustento}</fechaEmisionDocSustento>
            <fechaRegistroContable>${fechaEmision}</fechaRegistroContable>
            <numAutDocSustento></numAutDocSustento>
            <pagoLocExt>01</pagoLocExt>
            <totalSinImpuestos>${Number(retencion.retencion_renta_base).toFixed(2)}</totalSinImpuestos>
            <importeTotal>${(Number(retencion.retencion_renta_base) + Number(retencion.retencion_iva_base)).toFixed(2)}</importeTotal>
            <impuestosDocSustento>
                <impuestoDocSustento>
                    <codImpuestoDocSustento>2</codImpuestoDocSustento>
                    <codigoPorcentaje>4</codigoPorcentaje>
                    <baseImponible>${Number(retencion.retencion_renta_base).toFixed(2)}</baseImponible>
                    <tarifa>15.00</tarifa>
                    <valorImpuesto>${Number(retencion.retencion_iva_base).toFixed(2)}</valorImpuesto>
                </impuestoDocSustento>
            </impuestosDocSustento>
            <retenciones>${retencionesXML}
            </retenciones>
            <pagos>
                <pago>
                    <formaPago>20</formaPago>
                    <total>${(Number(retencion.retencion_renta_base) + Number(retencion.retencion_iva_base)).toFixed(2)}</total>
                </pago>
            </pagos>
        </docSustento>
    </docsSustento>
</comprobanteRetencion>`;

        return xml;
    }

    /**
     * Genera el PDF de la retención
     */
    private async generarPDFRetencion(retencion: ComprobanteRetencion, empresa: Empresa): Promise<string> {
        return new Promise((resolve, reject) => {
            const fileName = `retencion_${retencion.clave_acceso}.pdf`;
            const filePath = path.join(this.uploadsDir, fileName);

            const doc = new PDFDocument({ size: 'A4', margin: 40 });
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // --- HEADER ---
            // Logo (Placeholder o ruta real)
            const logosDir = path.join(process.cwd(), 'uploads', 'logos');
            const logoPath = path.join(logosDir, `${empresa.ruc}.png`);
            if (fs.existsSync(logoPath)) {
                try {
                    doc.image(logoPath, 40, 40, { width: 100 });
                } catch (e) { }
            }

            // Info Empresa (Derecha)
            doc.fontSize(16).font('Helvetica-Bold').text('COMPROBANTE DE RETENCIÓN', 250, 40, { align: 'right' });
            doc.fontSize(10).font('Helvetica')
                .text(`No. ${retencion.establecimiento}-${retencion.punto_emision}-${retencion.secuencial}`, 250, 60, { align: 'right' });

            doc.font('Helvetica-Bold').text('NÚMERO DE AUTORIZACIÓN', 250, 80, { align: 'right' });
            doc.font('Helvetica').fontSize(9).text(retencion.numero_autorizacion || 'PENDIENTE', 250, 95, { align: 'right' });

            doc.font('Helvetica-Bold').fontSize(10).text('CLAVE DE ACCESO', 250, 115, { align: 'right' });
            doc.font('Helvetica').fontSize(9).text(retencion.clave_acceso, 250, 130, { align: 'right' });

            // Info Emisor (Izquierda debajo logo)
            let y = 160;
            doc.fontSize(10).font('Helvetica-Bold').text(empresa.razon_social, 40, y);
            y += 15;
            doc.fontSize(9).font('Helvetica').text(`RUC: ${empresa.ruc}`, 40, y);
            y += 12;
            doc.text(`Dirección: ${empresa.direccion_matriz}`, 40, y, { width: 250 });
            y += 25;
            doc.text(`Obligado a llevar contabilidad: ${empresa.obligado_contabilidad ? 'SI' : 'NO'}`, 40, y);

            // --- PROVEEDOR ---
            y = 240;
            doc.moveTo(40, y).lineTo(550, y).stroke();
            y += 10;
            doc.fontSize(10).font('Helvetica-Bold').text('DATOS DEL SUJETO RETENIDO', 40, y);
            y += 20;

            doc.fontSize(9).font('Helvetica');
            doc.text('Razón Social:', 40, y);
            doc.text(retencion.razon_social_proveedor, 120, y);

            doc.text('Identificación:', 350, y);
            doc.text(retencion.ruc_proveedor, 420, y);

            y += 15;
            doc.text('Fecha Emisión:', 40, y);
            doc.text(this.formatearFecha(retencion.fecha_emision), 120, y);

            // --- DOCUMENTO SUSTENTO ---
            y += 25;
            doc.moveTo(40, y).lineTo(550, y).stroke();
            y += 10;
            doc.fontSize(10).font('Helvetica-Bold').text('COMPROBANTE QUE SUSTENTA LA RETENCIÓN', 40, y);
            y += 20;

            doc.fontSize(9).font('Helvetica');
            doc.text('Doc. Sustento:', 40, y);
            doc.text('FACTURA', 120, y);

            doc.text('Número:', 200, y);
            doc.text(retencion.numero_doc_sustento, 250, y);

            doc.text('Fecha Emisión:', 350, y);
            doc.text(this.formatearFecha(retencion.fecha_doc_sustento), 420, y);

            // --- TABLE HEADER ---
            y += 30;
            doc.rect(40, y, 515, 20).fill('#eeeeee').stroke();
            doc.fillColor('black');

            const rowY = y + 6;
            doc.fontSize(8).font('Helvetica-Bold');
            doc.text('EJERCICIO', 45, rowY, { width: 50, align: 'center' });
            doc.text('BASE IMP.', 100, rowY, { width: 80, align: 'right' });
            doc.text('IMPUESTO', 190, rowY, { width: 80, align: 'left' });
            doc.text('COD.', 280, rowY, { width: 40, align: 'center' });
            doc.text('% RET', 330, rowY, { width: 50, align: 'right' });
            doc.text('VALOR RETENIDO', 450, rowY, { width: 90, align: 'right' });

            // --- DETAILS ---
            y += 25;
            doc.font('Helvetica');
            const periodo = this.obtenerPeriodoFiscal(retencion.fecha_emision);

            // Retención Renta
            if (retencion.retencion_renta_valor && Number(retencion.retencion_renta_valor) > 0) {
                doc.text(periodo, 45, y, { width: 50, align: 'center' });
                doc.text(Number(retencion.retencion_renta_base).toFixed(2), 100, y, { width: 80, align: 'right' });
                doc.text('RENTA', 190, y);
                doc.text(retencion.retencion_renta_codigo, 280, y, { width: 40, align: 'center' });
                doc.text(Number(retencion.retencion_renta_porcentaje).toFixed(2), 330, y, { width: 50, align: 'right' });
                doc.text(Number(retencion.retencion_renta_valor).toFixed(2), 450, y, { width: 90, align: 'right' });
                y += 15;
            }

            // Retención IVA
            if (retencion.retencion_iva_valor && Number(retencion.retencion_iva_valor) > 0) {
                doc.text(periodo, 45, y, { width: 50, align: 'center' });
                doc.text(Number(retencion.retencion_iva_base).toFixed(2), 100, y, { width: 80, align: 'right' });
                doc.text('IVA', 190, y);
                doc.text(retencion.retencion_iva_codigo, 280, y, { width: 40, align: 'center' });
                doc.text(Number(retencion.retencion_iva_porcentaje).toFixed(2), 330, y, { width: 50, align: 'right' });
                doc.text(Number(retencion.retencion_iva_valor).toFixed(2), 450, y, { width: 90, align: 'right' });
                y += 15;
            }

            // --- TOTAL ---
            y += 10;
            doc.moveTo(400, y).lineTo(555, y).stroke();
            y += 5;
            doc.font('Helvetica-Bold').fontSize(10);
            doc.text('TOTAL:', 350, y, { width: 90, align: 'right' });
            doc.text(Number(retencion.total_retenido).toFixed(2), 450, y, { width: 90, align: 'right' });

            doc.end();

            stream.on('finish', () => {
                this.logger.log(`PDF de retención generado: ${filePath}`);
                resolve(filePath);
            });

            stream.on('error', (err) => {
                reject(err);
            });
        });
    }

    /**
     * Genera la clave de acceso de 49 dígitos para retención
     */
    private generarClaveAcceso(retencion: ComprobanteRetencion, empresa: Empresa): string {
        const fecha = retencion.fecha_emision;
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = String(fecha.getFullYear());

        const fechaStr = `${dia}${mes}${anio}`;
        const tipoComprobante = '07'; // Comprobante de Retención
        const ruc = empresa.ruc.padEnd(13, '0');
        const ambiente = this.ambiente === 'produccion' ? '2' : '1';
        const serie = `${retencion.establecimiento}${retencion.punto_emision}`;
        const secuencial = retencion.secuencial.padStart(9, '0');
        const codigoNumerico = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
        const tipoEmision = '1';

        const claveBase = `${fechaStr}${tipoComprobante}${ruc}${ambiente}${serie}${secuencial}${codigoNumerico}${tipoEmision}`;
        const digitoVerificador = this.calcularDigitoVerificador(claveBase);

        return `${claveBase}${digitoVerificador}`;
    }

    /**
     * Calcula el dígito verificador usando Módulo 11
     */
    private calcularDigitoVerificador(clave: string): string {
        const coeficientes = [2, 3, 4, 5, 6, 7];
        let suma = 0;

        for (let i = clave.length - 1, j = 0; i >= 0; i--, j++) {
            suma += parseInt(clave[i]) * coeficientes[j % 6];
        }

        const residuo = suma % 11;
        const digito = 11 - residuo;

        if (digito === 11) return '0';
        if (digito === 10) return '1';
        return String(digito);
    }

    /**
     * Obtiene el siguiente secuencial para retenciones
     */
    private async obtenerSiguienteSecuencial(empresa: Empresa): Promise<string> {
        const ultimaRetencion = await this.retencionRepository.findOne({
            where: {
                establecimiento: empresa.codigo_establecimiento || '001',
                punto_emision: empresa.punto_emision || '001',
            },
            order: { secuencial: 'DESC' },
        });

        if (ultimaRetencion) {
            const siguiente = parseInt(ultimaRetencion.secuencial) + 1;
            return String(siguiente).padStart(9, '0');
        }

        return '000000001';
    }

    private formatearFecha(fecha: Date): string {
        const d = new Date(fecha);
        const dia = String(d.getDate()).padStart(2, '0');
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const anio = d.getFullYear();
        return `${dia}/${mes}/${anio}`;
    }

    private obtenerPeriodoFiscal(fecha: Date): string {
        const d = new Date(fecha);
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const anio = d.getFullYear();
        return `${mes}/${anio}`;
    }

    private escapeXML(text: string): string {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    /**
     * Obtiene una retención por su ID
     */
    async findOne(id: number): Promise<ComprobanteRetencion> {
        return this.retencionRepository.findOne({
            where: { id },
            relations: ['compra', 'proveedor'],
        });
    }

    /**
     * Obtiene la retención de una compra
     */
    async findByCompra(compraId: number): Promise<ComprobanteRetencion> {
        return this.retencionRepository.findOne({
            where: { compra_id: compraId },
            relations: ['compra', 'proveedor'],
        });
    }

    /**
     * Lista retenciones con filtros
     */
    async findAll(filtros?: { desde?: Date; hasta?: Date; estado?: string }): Promise<ComprobanteRetencion[]> {
        const query = this.retencionRepository.createQueryBuilder('retencion')
            .leftJoinAndSelect('retencion.compra', 'compra')
            .leftJoinAndSelect('retencion.proveedor', 'proveedor')
            .orderBy('retencion.created_at', 'DESC');

        if (filtros?.desde && filtros?.hasta) {
            query.andWhere('retencion.fecha_emision BETWEEN :desde AND :hasta', {
                desde: filtros.desde,
                hasta: filtros.hasta,
            });
        }

        if (filtros?.estado) {
            query.andWhere('retencion.estado = :estado', { estado: filtros.estado });
        }

        return query.getMany();
    }
}
