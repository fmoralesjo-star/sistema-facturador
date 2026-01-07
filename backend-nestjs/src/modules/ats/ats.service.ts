import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Factura } from '../facturas/entities/factura.entity';
import { Compra } from '../compras/entities/compra.entity';
import { Empresa } from '../empresa/entities/empresa.entity';
import { GenerarAtsDto } from './dto/generar-ats.dto';
import { Builder } from 'xml2js';
import * as fs from 'fs';

@Injectable()
export class AtsService {
    constructor(
        @InjectRepository(Factura)
        private readonly facturaRepository: Repository<Factura>,
        @InjectRepository(Compra)
        private readonly compraRepository: Repository<Compra>,
        @InjectRepository(Empresa)
        private readonly empresaRepository: Repository<Empresa>,
    ) { }

    async generarATS(dto: GenerarAtsDto): Promise<string> {
        const { anio, mes } = dto;

        // Obtener fechas del período
        const fechaInicio = new Date(anio, mes - 1, 1);
        const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

        // Obtener datos de la empresa (opcional)
        let empresa;
        try {
            empresa = await this.empresaRepository.findOne({ where: {} });
        } catch (error) {
            console.warn('No se pudo cargar información de empresa:', error.message);
        }

        // Obtener ventas del período
        const ventas = await this.facturaRepository.find({
            where: {
                fecha: Between(fechaInicio, fechaFin),
                estado: 'AUTORIZADA'
            },
            relations: ['cliente']
        });

        // Obtener compras del período
        const compras = await this.compraRepository.find({
            where: {
                fecha: Between(fechaInicio, fechaFin)
            },
            relations: ['proveedor']
        });

        // Construir estructura XML del ATS
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

        // Generar XML
        const builder = new Builder({
            xmldec: { version: '1.0', encoding: 'UTF-8' },
            renderOpts: { pretty: true, indent: '  ' }
        });

        const xml = builder.buildObject(atsData);
        return xml;
    }

    private construirCompras(compras: Compra[]) {
        if (compras.length === 0) {
            return {};
        }

        const detallesCompras = compras.map(compra => {
            const baseImponible = parseFloat(compra.subtotal?.toString() || '0');
            const iva = parseFloat(compra.impuesto?.toString() || '0');

            return {
                codSustento: '01', // Crédito tributario
                tpIdProv: '04', // RUC
                idProv: compra.proveedor?.ruc || '9999999999001',
                tipoComprobante: '01', // Factura
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
                    formaPago: '01' // Sin utilización sistema financiero
                }
            };
        });

        return {
            detalleCompras: detallesCompras
        };
    }

    private construirVentas(ventas: Factura[]) {
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
                tipoComprobante: '18', // Factura consumidor final (simplificado)
                tipoEmision: 'E', // Electrónica
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

    private construirVentasEstablecimiento(ventas: Factura[]) {
        const totalVentas = this.calcularTotalVentas(ventas);

        return {
            ventaEst: {
                codEstab: '001',
                ventasEstab: totalVentas.toFixed(2),
                ivaComp: '0.00'
            }
        };
    }

    private calcularTotalVentas(ventas: Factura[]): number {
        return ventas.reduce((sum, venta) => {
            const total = parseFloat(venta.total?.toString() || '0');
            return sum + total;
        }, 0);
    }

    private formatearFecha(fecha: Date): string {
        const d = new Date(fecha);
        const dia = d.getDate().toString().padStart(2, '0');
        const mes = (d.getMonth() + 1).toString().padStart(2, '0');
        const anio = d.getFullYear();
        return `${dia}/${mes}/${anio}`;
    }

    async obtenerResumenPeriodo(dto: GenerarAtsDto) {
        const { anio, mes } = dto;
        const fechaInicio = new Date(anio, mes - 1, 1);
        const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

        const [ventas, compras] = await Promise.all([
            this.facturaRepository.find({
                where: {
                    fecha: Between(fechaInicio, fechaFin),
                    estado: 'AUTORIZADA'
                }
            }),
            this.compraRepository.find({
                where: {
                    fecha: Between(fechaInicio, fechaFin)
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
            retenciones: 0 // Por implementar
        };
    }
}
