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
var RideService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RideService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pdfkit_1 = require("pdfkit");
const fs = require("fs");
const path = require("path");
const factura_entity_1 = require("../../facturas/entities/factura.entity");
const voucher_entity_1 = require("../../facturas/entities/voucher.entity");
const empresa_service_1 = require("../../empresa/empresa.service");
const nota_credito_entity_1 = require("../../notas-credito/entities/nota-credito.entity");
const postgres_storage_service_1 = require("../../common/services/postgres-storage.service");
let RideService = RideService_1 = class RideService {
    constructor(facturaRepository, voucherRepository, notaCreditoRepository, empresaService, storageService) {
        this.facturaRepository = facturaRepository;
        this.voucherRepository = voucherRepository;
        this.notaCreditoRepository = notaCreditoRepository;
        this.empresaService = empresaService;
        this.storageService = storageService;
        this.logger = new common_1.Logger(RideService_1.name);
        this.uploadsDir = path.join(process.cwd(), 'uploads', 'rides');
        if (!fs.existsSync(this.uploadsDir)) {
            fs.mkdirSync(this.uploadsDir, { recursive: true });
        }
    }
    async generarRIDE(facturaId) {
        const factura = await this.facturaRepository.findOne({
            where: { id: facturaId },
            relations: ['cliente', 'detalles', 'detalles.producto', 'empresa'],
        });
        if (!factura) {
            throw new common_1.NotFoundException(`Factura con ID ${facturaId} no encontrada`);
        }
        let empresa = null;
        if (factura.empresa_id) {
            empresa = await this.empresaService.findOne(factura.empresa_id);
        }
        else {
            empresa = await this.empresaService.findActive();
        }
        if (!empresa) {
            throw new common_1.NotFoundException('No hay empresa configurada para generar el RIDE');
        }
        const voucher = await this.voucherRepository.findOne({
            where: { factura_id: facturaId },
        });
        if (!voucher || !voucher.clave_acceso) {
            throw new common_1.NotFoundException('La factura no tiene voucher o clave de acceso generada');
        }
        const base0 = factura.detalles
            .filter((d) => d.producto?.tipo_impuesto === '0' || d.producto?.tipo_impuesto === 'EXENTO')
            .reduce((sum, d) => sum + parseFloat(d.subtotal.toString()), 0);
        const baseGravable = factura.detalles
            .filter((d) => d.producto?.tipo_impuesto === '15')
            .reduce((sum, d) => sum + parseFloat(d.subtotal.toString()), 0);
        const iva = parseFloat(factura.impuesto.toString());
        const total = parseFloat(factura.total.toString());
        const nombreArchivo = `RIDE-${factura.numero}-${Date.now()}.pdf`;
        const rutaArchivo = path.join(this.uploadsDir, nombreArchivo);
        const doc = new pdfkit_1.default({
            size: 'LETTER',
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });
        const stream = fs.createWriteStream(rutaArchivo);
        doc.pipe(stream);
        await this.agregarLogo(doc, empresa);
        this.agregarEncabezado(doc, empresa, factura);
        this.agregarInformacionEmisor(doc, empresa, factura);
        this.agregarInformacionCliente(doc, factura);
        this.agregarTablaProductos(doc, factura);
        this.agregarCuadroTotales(doc, base0, baseGravable, iva, total);
        this.agregarInformacionAdicional(doc, factura, voucher);
        await this.agregarCodigoBarras(doc, voucher.clave_acceso);
        doc.end();
        await new Promise((resolve, reject) => {
            stream.on('finish', () => resolve());
            stream.on('error', (err) => reject(err));
        });
        const fileBuffer = fs.readFileSync(rutaArchivo);
        const fileId = await this.storageService.uploadFile(fileBuffer, nombreArchivo, 'application/pdf');
        voucher.ruta_pdf = `db://${fileId}`;
        await this.voucherRepository.save(voucher);
        this.logger.log(`RIDE generado y guardado en DB: ${fileId}`);
        return voucher.ruta_pdf;
    }
    async agregarLogo(doc, empresa) {
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
                }
                catch (error) {
                    this.logger.warn(`Error al cargar logo ${logoPath}: ${error.message}`);
                }
            }
        }
    }
    agregarEncabezado(doc, empresa, factura) {
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
    agregarInformacionEmisor(doc, empresa, factura) {
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
        doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke();
    }
    agregarInformacionCliente(doc, factura) {
        let y = 250;
        doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('CLIENTE:', 50, y);
        y += 15;
        doc.fontSize(9).font('Helvetica');
        const clienteNombre = factura.cliente?.nombre || 'Cliente Genérico';
        const clienteRuc = factura.cliente?.ruc || factura.cliente_id?.toString() || 'N/A';
        const clienteDireccion = factura.cliente_direccion || factura.cliente?.direccion || 'N/A';
        doc.text(`Nombre: ${clienteNombre}`, 50, y);
        y += 12;
        doc.text(`R.U.C./C.I.: ${clienteRuc}`, 50, y);
        y += 12;
        doc.text(`Dirección: ${clienteDireccion}`, 50, y);
        y += 12;
        doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke();
    }
    agregarTablaProductos(doc, factura) {
        let y = 340;
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
        doc.fontSize(8).font('Helvetica');
        for (const detalle of factura.detalles) {
            const producto = detalle.producto;
            const codigo = producto?.codigo || 'N/A';
            const nombre = producto?.nombre || 'Producto sin nombre';
            const cantidad = parseFloat(detalle.cantidad.toString());
            const precioUnitario = parseFloat(detalle.precio_unitario.toString());
            const subtotal = parseFloat(detalle.subtotal.toString());
            const nombreAjustado = nombre.length > 30 ? nombre.substring(0, 30) + '...' : nombre;
            doc.text(codigo, 50, y);
            doc.text(nombreAjustado, 120, y, { width: 270 });
            doc.text(cantidad.toFixed(2), 400, y, { width: 35, align: 'right' });
            doc.text(precioUnitario.toFixed(2), 440, y, { width: 55, align: 'right' });
            doc.text(subtotal.toFixed(2), 500, y, { width: 50, align: 'right' });
            y += 15;
            if (y > 650) {
                doc.addPage();
                y = 50;
            }
        }
        y += 5;
        doc.moveTo(50, y).lineTo(550, y).stroke();
    }
    agregarCuadroTotales(doc, base0, baseGravable, iva, total) {
        let y = 480;
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
        doc.moveTo(350, y + 5).lineTo(550, y + 5).stroke();
        y += 15;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('TOTAL:', 350, y, { width: 100, align: 'right' });
        doc.text(`$${total.toFixed(2)}`, 460, y, { width: 90, align: 'right' });
    }
    agregarInformacionAdicional(doc, factura, voucher) {
        let y = 580;
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
            doc.text(`Fecha Autorización: ${new Date(voucher.fecha_autorizacion).toLocaleDateString('es-EC')}`, 50, y);
            y += 12;
        }
        doc.text(`Ambiente: ${voucher.ambiente === '1' ? 'PRODUCCIÓN' : 'PRUEBAS'}`, 50, y);
        if (factura.info_adicional && Array.isArray(factura.info_adicional) && factura.info_adicional.length > 0) {
            y += 20;
            doc
                .fontSize(9)
                .font('Helvetica-Bold')
                .text('INFORMACIÓN ADICIONAL', 50, y);
            y += 15;
            doc.fontSize(8).font('Helvetica');
            const startY = y;
            for (const item of factura.info_adicional) {
                doc.text(`${item.nombre}:`, 50, y, { width: 200 });
                doc.text(`${item.valor}`, 250, y, { width: 250 });
                y += 12;
            }
        }
    }
    async agregarCodigoBarras(doc, claveAcceso) {
        const y = 650;
        doc
            .fontSize(8)
            .font('Helvetica-Bold')
            .text('CÓDIGO DE ACCESO', 150, y, {
            width: 400,
            align: 'center',
        });
        const claveFormateada = claveAcceso.match(/.{1,4}/g)?.join(' ') || claveAcceso;
        doc
            .fontSize(7)
            .font('Helvetica')
            .text(claveFormateada, 150, y + 15, {
            width: 400,
            align: 'center',
        });
        this.logger.log(`Clave de acceso agregada al RIDE: ${claveAcceso}`);
    }
    async obtenerRIDE(facturaId) {
        const voucher = await this.voucherRepository.findOne({
            where: { factura_id: facturaId },
        });
        if (!voucher || !voucher.ruta_pdf) {
            await this.generarRIDE(facturaId);
            const voucherActualizado = await this.voucherRepository.findOne({
                where: { factura_id: facturaId },
            });
            if (!voucherActualizado || !voucherActualizado.ruta_pdf) {
                throw new common_1.NotFoundException('No se pudo generar el RIDE');
            }
            return fs.readFileSync(voucherActualizado.ruta_pdf);
        }
        if (voucher.ruta_pdf && voucher.ruta_pdf.startsWith('db://')) {
            const fileData = await this.storageService.getFile(voucher.ruta_pdf);
            return fileData.buffer;
        }
        if (!fs.existsSync(voucher.ruta_pdf)) {
            await this.generarRIDE(facturaId);
            const voucherActualizado = await this.voucherRepository.findOne({
                where: { factura_id: facturaId },
            });
            if (!voucherActualizado || !voucherActualizado.ruta_pdf) {
                throw new common_1.NotFoundException('No se pudo generar el RIDE');
            }
            if (voucherActualizado.ruta_pdf.startsWith('db://')) {
                const fileData = await this.storageService.getFile(voucherActualizado.ruta_pdf);
                return fileData.buffer;
            }
            return fs.readFileSync(voucherActualizado.ruta_pdf);
        }
        return fs.readFileSync(voucher.ruta_pdf);
    }
    async obtenerRIDENotaCredito(ncId) {
        const ruta = await this.generarRIDENotaCredito(ncId);
        return fs.readFileSync(ruta);
    }
    async generarRIDENotaCredito(ncId) {
        const nc = await this.notaCreditoRepository.findOne({
            where: { id: ncId },
            relations: ['factura', 'cliente', 'detalles', 'factura.empresa']
        });
        if (!nc)
            throw new common_1.NotFoundException('Nota de Crédito no encontrada');
        let empresa = nc.factura?.empresa;
        if (!empresa)
            empresa = await this.empresaService.findActive();
        const nombreArchivo = `RIDE-NC-${nc.numero}-${Date.now()}.pdf`;
        const rutaArchivo = path.join(this.uploadsDir, nombreArchivo);
        const doc = new pdfkit_1.default({ size: 'LETTER', margins: { top: 50, bottom: 50, left: 50, right: 50 } });
        const stream = fs.createWriteStream(rutaArchivo);
        doc.pipe(stream);
        await this.agregarLogo(doc, empresa);
        const y = 60;
        doc.fontSize(16).font('Helvetica-Bold').text('NOTA DE CRÉDITO', 150, y, { align: 'center' });
        doc.fontSize(12).font('Helvetica').text(`No. ${nc.numero}`, 150, y + 25, { align: 'center' });
        doc.fontSize(10).text(`R.U.C.: ${empresa.ruc}`, 150, y + 40, { align: 'center' });
        this.agregarInformacionEmisor(doc, empresa, nc.factura || {});
        let yCliente = 250;
        doc.fontSize(10).font('Helvetica-Bold').text('CLIENTE:', 50, yCliente);
        yCliente += 15;
        doc.fontSize(9).font('Helvetica');
        const clienteNombre = nc.cliente?.nombre || 'Consumidor Final';
        const clienteRuc = nc.cliente?.ruc || '9999999999999';
        doc.text(`Nombre: ${clienteNombre}`, 50, yCliente);
        doc.text(`RUC/CI: ${clienteRuc}`, 50, yCliente + 12);
        doc.text(`Fecha Emisión: ${new Date(nc.fecha).toLocaleDateString()}`, 300, yCliente);
        yCliente += 35;
        doc.fontSize(9).font('Helvetica-Bold').text('COMPROBANTE QUE MODIFICA', 50, yCliente);
        yCliente += 15;
        doc.fontSize(8).font('Helvetica');
        doc.text(`Factura: ${nc.factura?.numero}`, 50, yCliente);
        doc.text(`Fecha Factura: ${nc.factura ? new Date(nc.factura.fecha).toLocaleDateString() : 'N/A'}`, 250, yCliente);
        doc.text(`Razón: ${nc.motivo}`, 50, yCliente + 15);
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
            doc.text(`Producto ID ${det.producto_id}`, 100, yTable);
            doc.text(det.precio_unitario.toString(), 400, yTable);
            doc.text(det.subtotal.toString(), 500, yTable);
            yTable += 15;
        }
        yTable += 20;
        doc.text(`Subtotal: $${nc.subtotal}`, 400, yTable);
        doc.text(`IVA: $${nc.impuesto}`, 400, yTable + 15);
        doc.text(`TOTAL: $${nc.total}`, 400, yTable + 30);
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
};
exports.RideService = RideService;
exports.RideService = RideService = RideService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(factura_entity_1.Factura)),
    __param(1, (0, typeorm_1.InjectRepository)(voucher_entity_1.Voucher)),
    __param(2, (0, typeorm_1.InjectRepository)(nota_credito_entity_1.NotaCredito)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        empresa_service_1.EmpresaService,
        postgres_storage_service_1.PostgresStorageService])
], RideService);
//# sourceMappingURL=ride.service.js.map