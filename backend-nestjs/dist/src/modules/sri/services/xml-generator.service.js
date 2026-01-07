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
var XmlGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.XmlGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const xmldom_1 = require("xmldom");
let XmlGeneratorService = XmlGeneratorService_1 = class XmlGeneratorService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(XmlGeneratorService_1.name);
        this.ambiente = this.configService.get('SRI_AMBIENTE', 'pruebas');
    }
    async generarXMLFactura(factura) {
        try {
            const claveAcceso = this.generarClaveAcceso(factura);
            const xml = this.construirXMLFactura(factura, claveAcceso);
            this.logger.log(`XML generado para factura ${factura.numero}`);
            return xml;
        }
        catch (error) {
            this.logger.error('Error al generar XML de factura:', error);
            throw error;
        }
    }
    async generarXMLNotaCredito(notaCredito) {
        try {
            const claveAcceso = this.generarClaveAcceso(notaCredito);
            const xml = this.construirXMLNotaCredito(notaCredito, claveAcceso);
            this.logger.log(`XML generado para Nota de Crédito ${notaCredito.numero}`);
            return xml;
        }
        catch (error) {
            this.logger.error('Error al generar XML de Nota de Crédito:', error);
            throw error;
        }
    }
    generarClaveAcceso(comprobante) {
        const fechaEmision = new Date(comprobante.fecha);
        const dia = String(fechaEmision.getDate()).padStart(2, '0');
        const mes = String(fechaEmision.getMonth() + 1).padStart(2, '0');
        const anio = String(fechaEmision.getFullYear()).padStart(4, '0');
        const fechaStr = dia + mes + anio;
        const tipoComprobante = (comprobante.tipo_comprobante || (comprobante.factura ? '04' : '01')).padStart(2, '0');
        const ruc = this.configService
            .get('SRI_RUC_EMISOR', '')
            .padStart(13, '0')
            .substring(0, 13);
        const ambiente = comprobante.ambiente || '2';
        const establecimiento = (comprobante.establecimiento || '001').padStart(3, '0');
        const puntoEmision = (comprobante.punto_emision || '001').padStart(3, '0');
        const secuencial = (comprobante.secuencial || comprobante.numero?.split('-')[2] || '').padStart(9, '0');
        const serie = (establecimiento + puntoEmision + secuencial + '00').padEnd(17, '0');
        const numeroSecuencial = secuencial.padStart(8, '0').substring(0, 8);
        const codigoNumerico = Math.floor(Math.random() * 100000000)
            .toString()
            .padStart(8, '0');
        const tipoEmision = '1';
        const claveSinVerificador = fechaStr +
            tipoComprobante +
            ruc +
            ambiente +
            serie +
            numeroSecuencial +
            codigoNumerico +
            tipoEmision;
        const digitoVerificador = this.calcularDigitoVerificador(claveSinVerificador);
        const claveAcceso = claveSinVerificador + digitoVerificador;
        return claveAcceso;
    }
    calcularDigitoVerificador(clave) {
        const factores = [2, 3, 4, 5, 6, 7];
        let suma = 0;
        let factorIndex = 0;
        for (let i = clave.length - 1; i >= 0; i--) {
            const digito = parseInt(clave[i], 10);
            suma += digito * factores[factorIndex % factores.length];
            factorIndex++;
        }
        const residuo = suma % 11;
        const digitoVerificador = residuo < 2 ? 11 - residuo : 11 - residuo;
        return digitoVerificador === 11 ? '0' : digitoVerificador.toString();
    }
    construirXMLFactura(factura, claveAcceso) {
        const fechaEmision = new Date(factura.fecha).toISOString().substring(0, 19);
        const ambiente = factura.ambiente === '1' ? 'produccion' : 'pruebas';
        const emisorRuc = this.configService.get('SRI_RUC_EMISOR', '');
        const emisorRazonSocial = factura.emisor_razon_social ||
            this.configService.get('SRI_RAZON_SOCIAL', '');
        const emisorNombreComercial = factura.emisor_nombre_comercial || emisorRazonSocial;
        const emisorDireccionMatriz = factura.emisor_direccion_matriz ||
            this.configService.get('SRI_DIRECCION_MATRIZ', '');
        const emisorDireccionEstablecimiento = factura.emisor_direccion_establecimiento || emisorDireccionMatriz;
        const cliente = factura.cliente || {};
        const clienteIdentificacion = cliente.ruc || factura.cliente_id?.toString() || '';
        const clienteRazonSocial = cliente.nombre || '';
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<factura id="comprobante" version="2.1.0">
  <infoTributaria>
    <ambiente>${factura.ambiente}</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>${this.escapeXML(emisorRazonSocial)}</razonSocial>
    <nombreComercial>${this.escapeXML(emisorNombreComercial)}</nombreComercial>
    <ruc>${emisorRuc}</ruc>
    <claveAcceso>${claveAcceso}</claveAcceso>
    <codDoc>${factura.tipo_comprobante}</codDoc>
    <estab>${factura.establecimiento}</estab>
    <ptoEmi>${factura.punto_emision}</ptoEmi>
    <secuencial>${factura.secuencial}</secuencial>
    <dirMatriz>${this.escapeXML(emisorDireccionMatriz)}</dirMatriz>
  </infoTributaria>
  
  <infoFactura>
    <fechaEmision>${fechaEmision}</fechaEmision>
    <dirEstablecimiento>${this.escapeXML(emisorDireccionEstablecimiento)}</dirEstablecimiento>
    <obligadoContabilidad>NO</obligadoContabilidad>
    <tipoIdentificacionComprador>04</tipoIdentificacionComprador>
    <razonSocialComprador>${this.escapeXML(clienteRazonSocial)}</razonSocialComprador>
    <identificacionComprador>${clienteIdentificacion}</identificacionComprador>
    <direccionComprador>${this.escapeXML(factura.cliente_direccion || '')}</direccionComprador>
    <totalSinImpuestos>${factura.subtotal.toFixed(2)}</totalSinImpuestos>
    <totalDescuento>0.00</totalDescuento>
    <totalImpuesto>
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>2</codigoPorcentaje>
        <baseImponible>${factura.subtotal.toFixed(2)}</baseImponible>
        <tarifa>12.00</tarifa>
        <valor>${factura.impuesto.toFixed(2)}</valor>
      </totalImpuesto>
    </totalImpuesto>
    <importeTotal>${factura.total.toFixed(2)}</importeTotal>
    <moneda>DOLAR</moneda>
    <pagos>
      <pago>
        <formaPago>${factura.forma_pago}</formaPago>
        <total>${factura.total.toFixed(2)}</total>
        <plazo>0</plazo>
        <unidadTiempo>dias</unidadTiempo>
      </pago>
    </pagos>
  </infoFactura>
  
  <detalles>
    ${this.generarDetallesXML(factura)}
  </detalles>
  
  <infoAdicional>
    <campoAdicional nombre="Dirección">${this.escapeXML(factura.cliente_direccion || '')}</campoAdicional>
    <campoAdicional nombre="Teléfono">${factura.cliente_telefono || ''}</campoAdicional>
    <campoAdicional nombre="Email">${factura.cliente_email || ''}</campoAdicional>
  </infoAdicional>
</factura>`;
        return xml;
    }
    construirXMLNotaCredito(nc, claveAcceso) {
        const fechaEmision = new Date(nc.fecha).toISOString().substring(0, 10).split('-').reverse().join('/');
        const emisorRuc = this.configService.get('SRI_RUC_EMISOR', '');
        const emisorRazonSocial = this.configService.get('SRI_RAZON_SOCIAL', '');
        const emisorDireccionMatriz = this.configService.get('SRI_DIRECCION_MATRIZ', '');
        const cliente = nc.cliente || {};
        const clienteIdentificacion = cliente.ruc || '';
        const clienteRazonSocial = cliente.nombre || '';
        const facturaOriginal = nc.factura || {};
        const fechaEmisionFactura = new Date(facturaOriginal.fecha).toISOString().substring(0, 10).split('-').reverse().join('/');
        return `<?xml version="1.0" encoding="UTF-8"?>
<notaCredito id="comprobante" version="1.0.0">
  <infoTributaria>
    <ambiente>${this.ambiente === 'produccion' ? '1' : '2'}</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>${this.escapeXML(emisorRazonSocial)}</razonSocial>
    <ruc>${emisorRuc}</ruc>
    <claveAcceso>${claveAcceso}</claveAcceso>
    <codDoc>04</codDoc>
    <estab>${nc.numero.split('-')[0]}</estab>
    <ptoEmi>${nc.numero.split('-')[1]}</ptoEmi>
    <secuencial>${nc.numero.split('-')[2]}</secuencial>
    <dirMatriz>${this.escapeXML(emisorDireccionMatriz)}</dirMatriz>
  </infoTributaria>
  <infoNotaCredito>
    <fechaEmision>${fechaEmision}</fechaEmision>
    <tipoIdentificacionComprador>04</tipoIdentificacionComprador>
    <razonSocialComprador>${this.escapeXML(clienteRazonSocial)}</razonSocialComprador>
    <identificacionComprador>${clienteIdentificacion}</identificacionComprador>
    <obligadoContabilidad>NO</obligadoContabilidad>
    <codDocModificado>01</codDocModificado>
    <numDocModificado>${facturaOriginal.numero || ''}</numDocModificado>
    <fechaEmisionDocSustento>${fechaEmisionFactura}</fechaEmisionDocSustento>
    <totalSinImpuestos>${nc.subtotal.toFixed(2)}</totalSinImpuestos>
    <valorModificacion>${nc.total.toFixed(2)}</valorModificacion>
    <moneda>DOLAR</moneda>
    <totalConImpuestos>
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>2</codigoPorcentaje>
        <baseImponible>${nc.subtotal.toFixed(2)}</baseImponible>
        <valor>${nc.impuesto.toFixed(2)}</valor>
      </totalImpuesto>
    </totalConImpuestos>
    <motivo>${this.escapeXML(nc.motivo || 'Devolución de mercadería')}</motivo>
  </infoNotaCredito>
  <detalles>
    ${this.generarDetallesNCXML(nc)}
  </detalles>
</notaCredito>`;
    }
    generarDetallesNCXML(nc) {
        const detalles = nc.detalles || [];
        return detalles.map(detalle => `
    <detalle>
      <codigoInterno>${detalle.producto_id}</codigoInterno>
      <descripcion>Producto ${detalle.producto_id}</descripcion>
      <cantidad>${detalle.cantidad.toFixed(2)}</cantidad>
      <precioUnitario>${detalle.precio_unitario.toFixed(2)}</precioUnitario>
      <descuento>0.00</descuento>
      <precioTotalSinImpuesto>${detalle.subtotal.toFixed(2)}</precioTotalSinImpuesto>
      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>2</codigoPorcentaje>
          <tarifa>12.00</tarifa>
          <baseImponible>${detalle.subtotal.toFixed(2)}</baseImponible>
          <valor>${(detalle.subtotal * 0.12).toFixed(2)}</valor>
        </impuesto>
      </impuestos>
    </detalle>`).join('');
    }
    generarDetallesXML(factura) {
        const detalles = factura.detalles || [];
        return detalles
            .map((detalle, index) => {
            const producto = detalle.producto || {};
            return `
    <detalle>
      <codigoPrincipal>${producto.codigo || ''}</codigoPrincipal>
      <codigoAuxiliar>${producto.codigo || ''}</codigoAuxiliar>
      <descripcion>${this.escapeXML(producto.nombre || detalle.producto_nombre || '')}</descripcion>
      <cantidad>${detalle.cantidad.toFixed(2)}</cantidad>
      <precioUnitario>${detalle.precio_unitario.toFixed(2)}</precioUnitario>
      <descuento>0.00</descuento>
      <precioTotalSinImpuesto>${detalle.subtotal.toFixed(2)}</precioTotalSinImpuesto>
      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>2</codigoPorcentaje>
          <tarifa>12.00</tarifa>
          <baseImponible>${detalle.subtotal.toFixed(2)}</baseImponible>
          <valor>${(detalle.subtotal * 0.12).toFixed(2)}</valor>
        </impuesto>
      </impuestos>
    </detalle>`;
        })
            .join('');
    }
    escapeXML(text) {
        if (!text)
            return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    validarXML(xml) {
        try {
            const parser = new xmldom_1.DOMParser();
            const doc = parser.parseFromString(xml, 'text/xml');
            const parseError = doc.getElementsByTagName('parsererror');
            if (parseError && parseError.length > 0) {
                const errorNode = parseError[0];
                if (errorNode.firstChild) {
                    this.logger.error('Error de parsing XML:', errorNode.firstChild.textContent);
                }
                return false;
            }
            return true;
        }
        catch (error) {
            this.logger.error('Error al validar XML:', error);
            return false;
        }
    }
};
exports.XmlGeneratorService = XmlGeneratorService;
exports.XmlGeneratorService = XmlGeneratorService = XmlGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], XmlGeneratorService);
//# sourceMappingURL=xml-generator.service.js.map