import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { Factura } from '../../facturas/entities/factura.entity';
import { Voucher } from '../../facturas/entities/voucher.entity';
import { Empresa } from '../../empresa/entities/empresa.entity';
import { EmpresaService } from '../../empresa/empresa.service';

import { NotaCredito } from '../../notas-credito/entities/nota-credito.entity';

import { PostgresStorageService } from '../../common/services/postgres-storage.service';

@Injectable()
export class RideService {
  private readonly logger = new Logger(RideService.name);
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'rides');

  constructor(
    @InjectRepository(Factura)
    private facturaRepository: Repository<Factura>,
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
    @InjectRepository(NotaCredito)
    private notaCreditoRepository: Repository<NotaCredito>,
    private empresaService: EmpresaService,
    private storageService: PostgresStorageService,
  ) {
    // Asegurar que el directorio de uploads existe
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Genera el PDF del RIDE (Representación Impresa del Documento Electrónico)
   */
  async generarRIDE(facturaId: number): Promise<string> {
    // Obtener factura con relaciones
    const factura = await this.facturaRepository.findOne({
      where: { id: facturaId },
      relations: ['cliente', 'detalles', 'detalles.producto', 'empresa'],
    });

    if (!factura) {
      throw new NotFoundException(`Factura con ID ${facturaId} no encontrada`);
    }

    // Obtener empresa (desde factura o activa)
    let empresa: Empresa | null = null;
    if (factura.empresa_id) {
      empresa = await this.empresaService.findOne(factura.empresa_id);
    } else {
      empresa = await this.empresaService.findActive();
    }

    if (!empresa) {
      throw new NotFoundException('No hay empresa configurada para generar el RIDE');
    }

    // Obtener voucher si existe
    const voucher = await this.voucherRepository.findOne({
      where: { factura_id: facturaId },
    });

    if (!voucher || !voucher.clave_acceso) {
      throw new NotFoundException(
        'La factura no tiene voucher o clave de acceso generada',
      );
    }

    // Calcular bases imponibles
    const base0 = factura.detalles
      .filter((d) => d.producto?.tipo_impuesto === '0' || d.producto?.tipo_impuesto === 'EXENTO')
      .reduce((sum, d) => sum + parseFloat(d.subtotal.toString()), 0);

    const baseGravable = factura.detalles
      .filter((d) => d.producto?.tipo_impuesto === '15')
      .reduce((sum, d) => sum + parseFloat(d.subtotal.toString()), 0);

    const iva = parseFloat(factura.impuesto.toString());
    const total = parseFloat(factura.total.toString());

    // Generar nombre del archivo
    const nombreArchivo = `RIDE-${factura.numero}-${Date.now()}.pdf`;
    const rutaArchivo = path.join(this.uploadsDir, nombreArchivo);

    // Crear PDF
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    // Pipe al archivo
    const stream = fs.createWriteStream(rutaArchivo);
    doc.pipe(stream);

    // Logo (si existe)
    await this.agregarLogo(doc, empresa);

    // Encabezado
    this.agregarEncabezado(doc, empresa, factura);

    // Información del Emisor
    this.agregarInformacionEmisor(doc, empresa, factura);

    // Información del Cliente
    this.agregarInformacionCliente(doc, factura);

    // Tabla de productos
    this.agregarTablaProductos(doc, factura);

    // Cuadro de Totales
    this.agregarCuadroTotales(doc, base0, baseGravable, iva, total);

    // Información adicional
    this.agregarInformacionAdicional(doc, factura, voucher);

    // Código de Barras
    await this.agregarCodigoBarras(doc, voucher.clave_acceso);

    // Finalizar PDF
    doc.end();

    // Esperar a que se escriba el archivo
    await new Promise<void>((resolve, reject) => {
      stream.on('finish', () => resolve());
      stream.on('error', (err) => reject(err));
    });

    // Leer archivo para guardar en DB
    const fileBuffer = fs.readFileSync(rutaArchivo);
    const fileId = await this.storageService.uploadFile(fileBuffer, nombreArchivo, 'application/pdf');

    // Actualizar voucher con referencia DB
    voucher.ruta_pdf = `db://${fileId}`;
    await this.voucherRepository.save(voucher);

    this.logger.log(`RIDE generado y guardado en DB: ${fileId}`);

    // Opcional: Eliminar archivo local para ahorrar espacio
    // fs.unlinkSync(rutaArchivo); 

    return voucher.ruta_pdf;
  }

  /**
   * Agrega el logo de la empresa al PDF
   */
  private async agregarLogo(
    doc: any,
    empresa: Empresa,
  ): Promise<void> {
    // Buscar logo en directorio de uploads/logos
    const logosDir = path.join(process.cwd(), 'uploads', 'logos');
    const posiblesLogos = [
      path.join(logosDir, `${empresa.ruc}.png`),
      path.join(logosDir, `${empresa.ruc}.jpg`),
      path.join(logosDir, 'logo.png'),
      path.join(logosDir, 'logo.jpg'),
    ];

    for (const logoPath of posiblesLogos) {
      if (fs.existsSync(logoPath)) {
        try {
          doc.image(logoPath, 50, 50, { width: 80, height: 80 });
          return;
        } catch (error) {
          this.logger.warn(`Error al cargar logo ${logoPath}: ${error.message}`);
        }
      }
    }

    // Si no hay logo, no hacer nada
  }

  /**
   * Agrega el encabezado al PDF
   */
  private agregarEncabezado(
    doc: any,
    empresa: Empresa,
    factura: Factura,
  ): void {
    const y = 60;

    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('COMPROBANTE DE VENTA', 150, y, { align: 'center' });

    doc
      .fontSize(12)
      .font('Helvetica')
      .text(`R.U.C.: ${empresa.ruc}`, 150, y + 25, { align: 'center' });

    doc.text(`FACTURA No. ${factura.numero}`, 150, y + 40, { align: 'center' });

    if (factura.clave_acceso) {
      doc
        .fontSize(8)
        .text(`Clave de Acceso: ${factura.clave_acceso}`, 50, y + 60, {
          width: 500,
          align: 'center',
        });
    }
  }

  /**
   * Agrega información del emisor
   */
  private agregarInformacionEmisor(
    doc: any,
    empresa: Empresa,
    factura: Factura,
  ): void {
    let y = 140;

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('EMISOR:', 50, y);

    y += 15;
    doc.fontSize(9).font('Helvetica');

    const razonSocial = factura.emisor_razon_social || empresa.razon_social;
    const direccion = factura.emisor_direccion_matriz || empresa.direccion_matriz;
    const telefono = factura.emisor_telefono || empresa.telefono;
    const email = factura.emisor_email || empresa.email;

    doc.text(`Razón Social: ${razonSocial}`, 50, y);
    y += 12;
    doc.text(`Dirección: ${direccion}`, 50, y);
    y += 12;
    if (telefono) {
      doc.text(`Teléfono: ${telefono}`, 50, y);
      y += 12;
    }
    if (email) {
      doc.text(`Email: ${email}`, 50, y);
      y += 12;
    }

    // Línea separadora
    doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke();
  }

  /**
   * Agrega información del cliente
   */
  private agregarInformacionCliente(
    doc: any,
    factura: Factura,
  ): void {
    let y = 250;

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('CLIENTE:', 50, y);

    y += 15;
    doc.fontSize(9).font('Helvetica');

    const clienteNombre =
      factura.cliente?.nombre || 'Cliente Genérico';
    const clienteRuc = factura.cliente?.ruc || factura.cliente_id?.toString() || 'N/A';
    const clienteDireccion =
      factura.cliente_direccion || factura.cliente?.direccion || 'N/A';

    doc.text(`Nombre: ${clienteNombre}`, 50, y);
    y += 12;
    doc.text(`R.U.C./C.I.: ${clienteRuc}`, 50, y);
    y += 12;
    doc.text(`Dirección: ${clienteDireccion}`, 50, y);
    y += 12;

    // Línea separadora
    doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke();
  }

  /**
   * Agrega tabla de productos
   */
  private agregarTablaProductos(
    doc: any,
    factura: Factura,
  ): void {
    let y = 340;

    // Encabezados de tabla
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Código', 50, y)
      .text('Descripción', 120, y)
      .text('Cant.', 400, y)
      .text('P. Unit.', 440, y)
      .text('Total', 500, y);

    y += 15;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;

    // Detalles
    doc.fontSize(8).font('Helvetica');
    for (const detalle of factura.detalles) {
      const producto = detalle.producto;
      const codigo = producto?.codigo || 'N/A';
      const nombre = producto?.nombre || 'Producto sin nombre';
      const cantidad = parseFloat(detalle.cantidad.toString());
      const precioUnitario = parseFloat(detalle.precio_unitario.toString());
      const subtotal = parseFloat(detalle.subtotal.toString());

      // Ajustar texto largo
      const nombreAjustado = nombre.length > 30 ? nombre.substring(0, 30) + '...' : nombre;

      doc.text(codigo, 50, y);
      doc.text(nombreAjustado, 120, y, { width: 270 });
      doc.text(cantidad.toFixed(2), 400, y, { width: 35, align: 'right' });
      doc.text(precioUnitario.toFixed(2), 440, y, { width: 55, align: 'right' });
      doc.text(subtotal.toFixed(2), 500, y, { width: 50, align: 'right' });

      y += 15;

      // Si se queda sin espacio, crear nueva página
      if (y > 650) {
        doc.addPage();
        y = 50;
      }
    }

    // Línea final de tabla
    y += 5;
    doc.moveTo(50, y).lineTo(550, y).stroke();
  }

  /**
   * Agrega cuadro de totales
   */
  private agregarCuadroTotales(
    doc: any,
    base0: number,
    baseGravable: number,
    iva: number,
    total: number,
  ): void {
    let y = 480;

    // Verificar si hay espacio, si no, nueva página
    if (y > 650) {
      doc.addPage();
      y = 50;
    }

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('TOTALES', 350, y);

    y += 20;
    doc.fontSize(8).font('Helvetica');

    if (base0 > 0) {
      doc.text('Base Imponible 0%:', 350, y, { width: 100, align: 'right' });
      doc.text(`$${base0.toFixed(2)}`, 460, y, { width: 90, align: 'right' });
      y += 15;
    }

    if (baseGravable > 0) {
      doc.text('Base Imponible IVA:', 350, y, { width: 100, align: 'right' });
      doc.text(`$${baseGravable.toFixed(2)}`, 460, y, { width: 90, align: 'right' });
      y += 15;

      doc.text('IVA 15%:', 350, y, { width: 100, align: 'right' });
      doc.text(`$${iva.toFixed(2)}`, 460, y, { width: 90, align: 'right' });
      y += 15;
    }

    // Línea separadora
    doc.moveTo(350, y + 5).lineTo(550, y + 5).stroke();
    y += 15;

    // Total
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('TOTAL:', 350, y, { width: 100, align: 'right' });
    doc.text(`$${total.toFixed(2)}`, 460, y, { width: 90, align: 'right' });
  }

  /**
   * Agrega información adicional
   */
  private agregarInformacionAdicional(
    doc: any,
    factura: Factura,
    voucher: Voucher,
  ): void {
    let y = 580;

    // Verificar si hay espacio, si no, nueva página
    if (y > 650) {
      doc.addPage();
      y = 50;
    }

    doc
      .fontSize(8)
      .font('Helvetica')
      .text(`Fecha Emisión: ${new Date(factura.fecha).toLocaleDateString('es-EC')}`, 50, y);

    y += 12;

    if (voucher.numero_autorizacion) {
      doc.text(`Nro. Autorización: ${voucher.numero_autorizacion}`, 50, y);
      y += 12;
    }

    if (voucher.fecha_autorizacion) {
      doc.text(
        `Fecha Autorización: ${new Date(voucher.fecha_autorizacion).toLocaleDateString('es-EC')}`,
        50,
        y,
      );
      y += 12;
    }

    doc.text(`Ambiente: ${voucher.ambiente === '1' ? 'PRODUCCIÓN' : 'PRUEBAS'}`, 50, y);

    // Campos Adicionales
    if (factura.info_adicional && Array.isArray(factura.info_adicional) && factura.info_adicional.length > 0) {
      y += 20;
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('INFORMACIÓN ADICIONAL', 50, y);
      y += 15;
      doc.fontSize(8).font('Helvetica');

      // Bordes
      const startY = y;
      for (const item of factura.info_adicional) {
        doc.text(`${item.nombre}:`, 50, y, { width: 200 });
        doc.text(`${item.valor}`, 250, y, { width: 250 });
        y += 12;
      }

      // Marco opcional
      // doc.rect(40, startY - 5, 510, y - startY + 5).stroke();
    }
  }

  /**
   * Agrega código de barras Code128
   * Nota: Por ahora se muestra la clave de acceso en formato texto.
   * Para implementar código de barras real, se puede usar una librería como jsbarcode en el frontend
   * o implementar la generación usando una librería específica para Node.js.
   */
  private async agregarCodigoBarras(
    doc: any,
    claveAcceso: string,
  ): Promise<void> {
    const y = 650;

    // Mostrar clave de acceso formateada
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('CÓDIGO DE ACCESO', 150, y, {
        width: 400,
        align: 'center',
      });

    // Clave de acceso dividida en grupos para mejor legibilidad
    const claveFormateada = claveAcceso.match(/.{1,4}/g)?.join(' ') || claveAcceso;

    doc
      .fontSize(7)
      .font('Helvetica')
      .text(claveFormateada, 150, y + 15, {
        width: 400,
        align: 'center',
      });

    // Nota: Para generar código de barras Code128 real, se recomienda:
    // 1. Usar jsbarcode en el frontend para mostrar el código de barras en HTML
    // 2. O implementar una solución usando canvas y una librería de código de barras compatible con Node.js
    // 3. El código de barras se puede generar como imagen y luego insertar en el PDF

    this.logger.log(`Clave de acceso agregada al RIDE: ${claveAcceso}`);
  }

  /**
   * Obtiene el archivo PDF del RIDE
   */
  async obtenerRIDE(facturaId: number): Promise<Buffer> {
    const voucher = await this.voucherRepository.findOne({
      where: { factura_id: facturaId },
    });

    if (!voucher || !voucher.ruta_pdf) {
      // Generar RIDE si no existe
      await this.generarRIDE(facturaId);

      // Recargar voucher
      const voucherActualizado = await this.voucherRepository.findOne({
        where: { factura_id: facturaId },
      });

      if (!voucherActualizado || !voucherActualizado.ruta_pdf) {
        throw new NotFoundException('No se pudo generar el RIDE');
      }

      return fs.readFileSync(voucherActualizado.ruta_pdf);
    }

    if (voucher.ruta_pdf && voucher.ruta_pdf.startsWith('db://')) {
      const fileData = await this.storageService.getFile(voucher.ruta_pdf);
      return fileData.buffer;
    }

    if (!fs.existsSync(voucher.ruta_pdf)) {
      // Si el archivo no existe, regenerar
      await this.generarRIDE(facturaId);

      const voucherActualizado = await this.voucherRepository.findOne({
        where: { factura_id: facturaId },
      });

      if (!voucherActualizado || !voucherActualizado.ruta_pdf) {
        throw new NotFoundException('No se pudo generar el RIDE');
      }

      if (voucherActualizado.ruta_pdf.startsWith('db://')) {
        const fileData = await this.storageService.getFile(voucherActualizado.ruta_pdf);
        return fileData.buffer;
      }

      return fs.readFileSync(voucherActualizado.ruta_pdf);
    }

    return fs.readFileSync(voucher.ruta_pdf);
  }
  async obtenerRIDENotaCredito(ncId: number): Promise<Buffer> {
    // Por ahora generamos al vuelo sin guardar en voucher (o implementamos voucher para NC después)
    const ruta = await this.generarRIDENotaCredito(ncId);
    return fs.readFileSync(ruta);
  }

  async generarRIDENotaCredito(ncId: number): Promise<string> {
    const nc = await this.notaCreditoRepository.findOne({
      where: { id: ncId },
      relations: ['factura', 'cliente', 'detalles', 'factura.empresa']
    });

    if (!nc) throw new NotFoundException('Nota de Crédito no encontrada');

    // Empresa
    let empresa = nc.factura?.empresa;
    if (!empresa) empresa = await this.empresaService.findActive();

    const nombreArchivo = `RIDE-NC-${nc.numero}-${Date.now()}.pdf`;
    const rutaArchivo = path.join(this.uploadsDir, nombreArchivo);

    const doc = new PDFDocument({ size: 'LETTER', margins: { top: 50, bottom: 50, left: 50, right: 50 } });
    const stream = fs.createWriteStream(rutaArchivo);
    doc.pipe(stream);

    // Reutilizar componentes
    await this.agregarLogo(doc, empresa);

    // Encabezado Provisorio NC
    const y = 60;
    doc.fontSize(16).font('Helvetica-Bold').text('NOTA DE CRÉDITO', 150, y, { align: 'center' });
    doc.fontSize(12).font('Helvetica').text(`No. ${nc.numero}`, 150, y + 25, { align: 'center' });
    doc.fontSize(10).text(`R.U.C.: ${empresa.ruc}`, 150, y + 40, { align: 'center' });

    // Info Emisor
    this.agregarInformacionEmisor(doc, empresa, nc.factura || {} as any); // Usamos factura para datos de emisor si están snapshot

    // Info Cliente
    let yCliente = 250;
    doc.fontSize(10).font('Helvetica-Bold').text('CLIENTE:', 50, yCliente);
    yCliente += 15;
    doc.fontSize(9).font('Helvetica');
    const clienteNombre = nc.cliente?.nombre || 'Consumidor Final';
    const clienteRuc = nc.cliente?.ruc || '9999999999999';
    doc.text(`Nombre: ${clienteNombre}`, 50, yCliente);
    doc.text(`RUC/CI: ${clienteRuc}`, 50, yCliente + 12);
    doc.text(`Fecha Emisión: ${new Date(nc.fecha).toLocaleDateString()}`, 300, yCliente);

    // Info Modificación
    yCliente += 35;
    doc.fontSize(9).font('Helvetica-Bold').text('COMPROBANTE QUE MODIFICA', 50, yCliente);
    yCliente += 15;
    doc.fontSize(8).font('Helvetica');
    doc.text(`Factura: ${nc.factura?.numero}`, 50, yCliente);
    doc.text(`Fecha Factura: ${nc.factura ? new Date(nc.factura.fecha).toLocaleDateString() : 'N/A'}`, 250, yCliente);
    doc.text(`Razón: ${nc.motivo}`, 50, yCliente + 15);

    // Tabla Productos
    let yTable = yCliente + 40;
    doc.moveTo(50, yTable).lineTo(550, yTable).stroke();
    yTable += 5;
    doc.text('Cant', 50, yTable);
    doc.text('Descripción', 100, yTable);
    doc.text('P.Unit', 400, yTable);
    doc.text('Total', 500, yTable);
    yTable += 15;

    for (const det of nc.detalles) {
      doc.text(det.cantidad.toString(), 50, yTable);
      doc.text(`Producto ID ${det.producto_id}`, 100, yTable); // Deberíamos hacer fetch de nombre de producto
      doc.text(det.precio_unitario.toString(), 400, yTable);
      doc.text(det.subtotal.toString(), 500, yTable);
      yTable += 15;
    }

    // Totales
    yTable += 20;
    doc.text(`Subtotal: $${nc.subtotal}`, 400, yTable);
    doc.text(`IVA: $${nc.impuesto}`, 400, yTable + 15);
    doc.text(`TOTAL: $${nc.total}`, 400, yTable + 30);

    // Info Adicional
    if (nc.info_adicional && Array.isArray(nc.info_adicional)) {
      let yInfo = yTable + 60;
      doc.font('Helvetica-Bold').text('Información Adicional', 50, yInfo);
      yInfo += 15;
      doc.font('Helvetica');
      for (const item of nc.info_adicional) {
        doc.text(`${item.nombre}: ${item.valor}`, 50, yInfo);
        yInfo += 12;
      }
    }

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(rutaArchivo));
      stream.on('error', reject);
    });
  }
}

