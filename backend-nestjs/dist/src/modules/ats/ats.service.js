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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const factura_entity_1 = require("../facturas/entities/factura.entity");
const compra_entity_1 = require("../compras/entities/compra.entity");
const empresa_entity_1 = require("../empresa/entities/empresa.entity");
const xml2js_1 = require("xml2js");
let AtsService = class AtsService {
    constructor(facturaRepository, compraRepository, empresaRepository) {
        this.facturaRepository = facturaRepository;
        this.compraRepository = compraRepository;
        this.empresaRepository = empresaRepository;
    }
    async generarATS(dto) {
        const { anio, mes } = dto;
        const fechaInicio = new Date(anio, mes - 1, 1);
        const fechaFin = new Date(anio, mes, 0, 23, 59, 59);
        let empresa;
        try {
            empresa = await this.empresaRepository.findOne({ where: {} });
        }
        catch (error) {
            console.warn('No se pudo cargar información de empresa:', error.message);
        }
        const ventas = await this.facturaRepository.find({
            where: {
                fecha: (0, typeorm_2.Between)(fechaInicio, fechaFin),
                estado: 'AUTORIZADA'
            },
            relations: ['cliente']
        });
        const compras = await this.compraRepository.find({
            where: {
                fecha: (0, typeorm_2.Between)(fechaInicio, fechaFin)
            },
            relations: ['proveedor']
        });
        const atsData = {
            iva: {
                TipoIDInformante: 'R',
                IdInformante: empresa?.ruc || '9999999999001',
                razonSocial: empresa?.razon_social || 'MI EMPRESA',
                Anio: anio.toString(),
                Mes: mes.toString().padStart(2, '0'),
                numEstabRuc: '001',
                totalVentas: this.calcularTotalVentas(ventas).toFixed(2),
                codigoOperativo: 'IVA',
                compras: this.construirCompras(compras),
                ventas: this.construirVentas(ventas),
                ventasEstablecimiento: this.construirVentasEstablecimiento(ventas),
                anulados: { detalleAnulados: [] }
            }
        };
        const builder = new xml2js_1.Builder({
            xmldec: { version: '1.0', encoding: 'UTF-8' },
            renderOpts: { pretty: true, indent: '  ' }
        });
        const xml = builder.buildObject(atsData);
        return xml;
    }
    construirCompras(compras) {
        if (compras.length === 0) {
            return {};
        }
        const detallesCompras = compras.map(compra => {
            const baseImponible = parseFloat(compra.subtotal?.toString() || '0');
            const iva = parseFloat(compra.impuesto?.toString() || '0');
            return {
                codSustento: '01',
                tpIdProv: '04',
                idProv: compra.proveedor?.ruc || '9999999999001',
                tipoComprobante: '01',
                parteRel: 'NO',
                fechaRegistro: this.formatearFecha(compra.fecha),
                establecimiento: '001',
                puntoEmision: '001',
                secuencial: compra.numero?.padStart(9, '0') || '000000001',
                fechaEmision: this.formatearFecha(compra.fecha),
                autorizacion: compra.autorizacion || '0000000000',
                baseNoGraIva: '0.00',
                baseImponible: baseImponible.toFixed(2),
                baseImpGrav: baseImponible.toFixed(2),
                baseImpExe: '0.00',
                montoIce: '0.00',
                montoIva: iva.toFixed(2),
                valorRetBienes: '0.00',
                valorRetServicios: '0.00',
                valRetServ100: '0.00',
                totbasesImpReemb: '0.00',
                formasDePago: {
                    formaPago: '01'
                }
            };
        });
        return {
            detalleCompras: detallesCompras
        };
    }
    construirVentas(ventas) {
        if (ventas.length === 0) {
            return {};
        }
        const detallesVentas = ventas.map(venta => {
            const baseImponible = parseFloat(venta.subtotal?.toString() || '0');
            const iva = parseFloat(venta.impuesto?.toString() || '0');
            const tipoId = venta.cliente?.ruc?.length === 13 ? '04' : '05';
            const identificacion = venta.cliente?.ruc || '9999999999999';
            return {
                tpIdCliente: tipoId,
                idCliente: identificacion,
                parteRelVtas: 'NO',
                tipoComprobante: '18',
                tipoEmision: 'E',
                numeroComprobantes: 1,
                baseNoGraIva: '0.00',
                baseImponible: baseImponible.toFixed(2),
                baseImpGrav: baseImponible.toFixed(2),
                montoIva: iva.toFixed(2),
                montoIce: '0.00',
                valorRetIva: '0.00',
                valorRetRenta: '0.00',
                formasDePago: {
                    formaPago: '01'
                }
            };
        });
        return {
            detalleVentas: detallesVentas
        };
    }
    construirVentasEstablecimiento(ventas) {
        const totalVentas = this.calcularTotalVentas(ventas);
        return {
            ventaEst: {
                codEstab: '001',
                ventasEstab: totalVentas.toFixed(2),
                ivaComp: '0.00'
            }
        };
    }
    calcularTotalVentas(ventas) {
        return ventas.reduce((sum, venta) => {
            const total = parseFloat(venta.total?.toString() || '0');
            return sum + total;
        }, 0);
    }
    formatearFecha(fecha) {
        const d = new Date(fecha);
        const dia = d.getDate().toString().padStart(2, '0');
        const mes = (d.getMonth() + 1).toString().padStart(2, '0');
        const anio = d.getFullYear();
        return `${dia}/${mes}/${anio}`;
    }
    async obtenerResumenPeriodo(dto) {
        const { anio, mes } = dto;
        const fechaInicio = new Date(anio, mes - 1, 1);
        const fechaFin = new Date(anio, mes, 0, 23, 59, 59);
        const [ventas, compras] = await Promise.all([
            this.facturaRepository.find({
                where: {
                    fecha: (0, typeorm_2.Between)(fechaInicio, fechaFin),
                    estado: 'AUTORIZADA'
                }
            }),
            this.compraRepository.find({
                where: {
                    fecha: (0, typeorm_2.Between)(fechaInicio, fechaFin)
                }
            })
        ]);
        const totalVentas = ventas.reduce((sum, v) => sum + parseFloat(v.total?.toString() || '0'), 0);
        const totalCompras = compras.reduce((sum, c) => sum + parseFloat(c.total?.toString() || '0'), 0);
        return {
            periodo: `${mes}/${anio}`,
            totalVentas: totalVentas.toFixed(2),
            cantidadVentas: ventas.length,
            totalCompras: totalCompras.toFixed(2),
            cantidadCompras: compras.length,
            retenciones: 0
        };
    }
};
exports.AtsService = AtsService;
exports.AtsService = AtsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(factura_entity_1.Factura)),
    __param(1, (0, typeorm_1.InjectRepository)(compra_entity_1.Compra)),
    __param(2, (0, typeorm_1.InjectRepository)(empresa_entity_1.Empresa)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AtsService);
//# sourceMappingURL=ats.service.js.map