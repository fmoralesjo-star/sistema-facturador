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
exports.ContabilidadService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const asiento_contable_entity_1 = require("./entities/asiento-contable.entity");
const partida_contable_entity_1 = require("./entities/partida-contable.entity");
const cuenta_contable_entity_1 = require("./entities/cuenta-contable.entity");
const plantilla_asiento_entity_1 = require("./entities/plantilla-asiento.entity");
const factura_entity_1 = require("../facturas/entities/factura.entity");
const compra_entity_1 = require("../compras/entities/compra.entity");
const plantillas_service_1 = require("./services/plantillas.service");
const plantilla_detalle_entity_1 = require("./entities/plantilla-detalle.entity");
let ContabilidadService = class ContabilidadService {
    constructor(asientoRepository, partidaRepository, cuentaRepository, facturaRepository, compraRepository, plantillaRepository, plantillasService) {
        this.asientoRepository = asientoRepository;
        this.partidaRepository = partidaRepository;
        this.cuentaRepository = cuentaRepository;
        this.facturaRepository = facturaRepository;
        this.compraRepository = compraRepository;
        this.plantillaRepository = plantillaRepository;
        this.plantillasService = plantillasService;
    }
    async validarPeriodoAbierto(fecha, queryRunner) {
    }
    validarPartidaDoble(partidas) {
        const totalDebe = partidas.reduce((sum, p) => sum + Number(p.debe), 0);
        const totalHaber = partidas.reduce((sum, p) => sum + Number(p.haber), 0);
        const debeRedondeado = Math.round(totalDebe * 100) / 100;
        const haberRedondeado = Math.round(totalHaber * 100) / 100;
        const diferencia = Math.abs(debeRedondeado - haberRedondeado);
        if (diferencia > 0.00) {
            throw new common_1.BadRequestException(`Violación de Partida Doble: El asiento no cuadra. Total Debe ($${debeRedondeado.toFixed(2)}) !== Total Haber ($${haberRedondeado.toFixed(2)}). Diferencia: $${diferencia.toFixed(2)}`);
        }
    }
    async generarAsientoCierre(anio, usuarioId) {
        return null;
    }
    async crearAsientoNomina(datosNomina) {
        const asiento = new asiento_contable_entity_1.AsientoContable();
        asiento.fecha = new Date();
        asiento.descripcion = `Rol de Pagos - ${datosNomina.periodo}`;
        asiento.tipo = 'DIARIO';
        asiento.origen_modulo = 'RECURSOS_HUMANOS';
        asiento.origen_id = 0;
        asiento.estado = 'BORRADOR';
        const asientoGuardado = await this.asientoRepository.save(asiento);
        const partidas = [];
        partidas.push(this.partidaRepository.create({
            asiento_id: asientoGuardado.id,
            cuenta: { id: 85 },
            descripcion: `Sueldos y Salarios ${datosNomina.periodo}`,
            debe: datosNomina.totalIngresos,
            haber: 0
        }));
        partidas.push(this.partidaRepository.create({
            asiento_id: asientoGuardado.id,
            cuenta: { id: 86 },
            descripcion: `Aporte Patronal ${datosNomina.periodo}`,
            debe: datosNomina.totalAportePatronal,
            haber: 0
        }));
        const totalIess = datosNomina.totalIessPersonal + datosNomina.totalAportePatronal;
        partidas.push(this.partidaRepository.create({
            asiento_id: asientoGuardado.id,
            cuenta: { id: 45 },
            descripcion: `IESS por Pagar ${datosNomina.periodo}`,
            debe: 0,
            haber: totalIess
        }));
        partidas.push(this.partidaRepository.create({
            asiento_id: asientoGuardado.id,
            cuenta: { id: 46 },
            descripcion: `Sueldos por Pagar ${datosNomina.periodo}`,
            debe: 0,
            haber: datosNomina.totalPagar
        }));
        for (const partida of partidas) {
            await this.partidaRepository.save(partida);
        }
        asientoGuardado.total_debe = partidas.reduce((s, p) => s + Number(p.debe), 0);
        asientoGuardado.total_haber = partidas.reduce((s, p) => s + Number(p.haber), 0);
        asientoGuardado.estado = 'ACTIVO';
        return this.asientoRepository.save(asientoGuardado);
    }
    async createAsiento(createDto) {
        await this.validarPeriodoAbierto(createDto.fecha);
        this.validarPartidaDoble(createDto.partidas);
        const totalDebe = createDto.partidas.reduce((sum, p) => sum + p.debe, 0);
        const totalHaber = createDto.partidas.reduce((sum, p) => sum + p.haber, 0);
        const numeroAsiento = `AS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const asiento = this.asientoRepository.create({
            numero_asiento: numeroAsiento,
            fecha: createDto.fecha,
            descripcion: createDto.descripcion,
            tipo: createDto.tipo || null,
            factura_id: createDto.factura_id || null,
            total_debe: totalDebe,
            total_haber: totalHaber,
        });
        const asientoGuardado = await this.asientoRepository.save(asiento);
        const partidas = createDto.partidas.map((partida) => this.partidaRepository.create({
            asiento_id: asientoGuardado.id,
            cuenta_id: partida.cuenta_id,
            debe: partida.debe,
            haber: partida.haber,
            descripcion: partida.descripcion || null,
        }));
        await this.partidaRepository.save(partidas);
        return this.asientoRepository.findOne({
            where: { id: asientoGuardado.id },
            relations: ['partidas', 'partidas.cuenta'],
        });
    }
    async crearAsientosFactura(factura, queryRunner) {
        await this.validarPeriodoAbierto(new Date(), queryRunner);
        const partidasGeneradas = await this.plantillasService.procesarPlantilla('VENTA_FACTURA', {
            factura,
            total: Number(factura.total),
            subtotal: Number(factura.subtotal),
            iva: Number(factura.impuesto),
            cliente_id: factura.cliente_id
        });
        const manager = queryRunner ? queryRunner.manager : this.asientoRepository.manager;
        const numeroAsiento = `AS-FACT-${factura.id}-${Date.now()}`;
        const asiento = manager.create(asiento_contable_entity_1.AsientoContable, {
            numero_asiento: numeroAsiento,
            fecha: new Date(),
            descripcion: `Factura ${factura.numero} - Cliente: ${factura.cliente?.nombre || 'Consumidor Final'}`,
            tipo: 'VENTA',
            factura_id: factura.id,
            total_debe: partidasGeneradas.reduce((s, p) => s + Number(p.debe), 0),
            total_haber: partidasGeneradas.reduce((s, p) => s + Number(p.haber), 0),
        });
        this.validarPartidaDoble(partidasGeneradas);
        const savedAsiento = await manager.save(asiento);
        partidasGeneradas.forEach(p => p.asiento_id = savedAsiento.id);
        await manager.save(partida_contable_entity_1.PartidaContable, partidasGeneradas);
        return savedAsiento;
    }
    async crearAsientoTransferencia(datos) {
        return null;
    }
    async crearAsientoCompra(compra, queryRunner) {
        await this.validarPeriodoAbierto(new Date(), queryRunner);
        const partidasGeneradas = await this.plantillasService.procesarPlantilla('COMPRA_INVENTARIO', {
            total: Number(compra.total),
            subtotal: Number(compra.subtotal),
            iva: Number(compra.impuesto),
            retencion_renta: Number(compra.retencion_renta_valor || 0),
            retencion_iva: Number(compra.retencion_iva_valor || 0),
            proveedor_id: compra.proveedor_id
        });
        const manager = queryRunner ? queryRunner.manager : this.asientoRepository.manager;
        const numeroAsiento = `AS-COMP-${compra.id}-${Date.now()}`;
        const asiento = manager.create(asiento_contable_entity_1.AsientoContable, {
            numero_asiento: numeroAsiento,
            fecha: new Date(),
            descripcion: `Compra ${compra.numero} - Proveedor: ${compra.proveedor?.razon_social || 'Proveedor Varios'}`,
            tipo: 'COMPRA',
            total_debe: partidasGeneradas.reduce((s, p) => s + Number(p.debe), 0),
            total_haber: partidasGeneradas.reduce((s, p) => s + Number(p.haber), 0),
        });
        this.validarPartidaDoble(partidasGeneradas);
        const savedAsiento = await manager.save(asiento_contable_entity_1.AsientoContable, asiento);
        partidasGeneradas.forEach(p => p.asiento_id = savedAsiento.id);
        await manager.save(partida_contable_entity_1.PartidaContable, partidasGeneradas);
        return savedAsiento;
    }
    async crearAsientoAjusteInventario(datos) {
        const { producto, cantidad, tipo, motivo, valorUnitario, queryRunner } = datos;
        const total = Math.abs(cantidad * valorUnitario);
        await this.validarPeriodoAbierto(new Date(), queryRunner);
        const manager = queryRunner ? queryRunner.manager : this.asientoRepository.manager;
        const numeroAsiento = `AS-INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const asiento = manager.create(asiento_contable_entity_1.AsientoContable, {
            numero_asiento: numeroAsiento,
            fecha: new Date(),
            descripcion: `Ajuste Inventario - ${producto.nombre} (${tipo}) - ${motivo}`,
            tipo: 'AJUSTE',
            total_debe: total,
            total_haber: total,
            origen_modulo: 'INVENTARIO',
            origen_id: producto.id
        });
        const savedAsiento = await manager.save(asiento);
        const partidas = [];
        if (cantidad > 0) {
            partidas.push(manager.create(partida_contable_entity_1.PartidaContable, {
                asiento_id: savedAsiento.id,
                cuenta_codigo: '@INVENTARIO',
                descripcion: `Entrada Stock: ${producto.nombre}`,
                debe: total,
                haber: 0
            }));
            partidas.push(manager.create(partida_contable_entity_1.PartidaContable, {
                asiento_id: savedAsiento.id,
                cuenta_codigo: '@INGRESO_AJUSTE_INV',
                descripcion: `Ajuste (+) ${motivo}`,
                debe: 0,
                haber: total
            }));
        }
        else {
            partidas.push(manager.create(partida_contable_entity_1.PartidaContable, {
                asiento_id: savedAsiento.id,
                cuenta_codigo: '@GASTO_AJUSTE_INV',
                descripcion: `Ajuste (-) ${motivo}`,
                debe: total,
                haber: 0
            }));
            partidas.push(manager.create(partida_contable_entity_1.PartidaContable, {
                asiento_id: savedAsiento.id,
                cuenta_codigo: '@INVENTARIO',
                descripcion: `Salida Stock: ${producto.nombre}`,
                debe: 0,
                haber: total
            }));
        }
        return savedAsiento;
    }
    async crearAsientoNotaCredito(datos) {
        return null;
    }
    async anularAsientoFactura(factura, queryRunner) {
        return null;
    }
    async generarDatosEjemplo() {
        const stats = { facturas: 0, compras: 0, errores: 0 };
        await this.assicurePlantillasBasicas();
        try {
            const facturasPendientes = await this.facturaRepository.find({
                where: { asiento_contable_creado: false, estado: 'AUTORIZADO' },
                take: 50
            });
            let facturasProcesar = facturasPendientes;
            if (facturasPendientes.length === 0) {
                facturasProcesar = await this.facturaRepository.find({
                    where: { asiento_contable_creado: false },
                    take: 20
                });
            }
            for (const f of facturasProcesar) {
                if (f.estado === 'ANULADA')
                    continue;
                try {
                    await this.crearAsientosFactura(f, null);
                    f.asiento_contable_creado = true;
                    await this.facturaRepository.save(f);
                    stats.facturas++;
                }
                catch (e) {
                    console.error(`Error contabilizando factura ${f.numero}:`, e.message);
                    stats.errores++;
                }
            }
        }
        catch (e) {
            console.error('Error buscando facturas', e);
        }
        try {
            const comprasPendientes = await this.compraRepository.find({
                where: { asiento_contable_creado: false },
                relations: ['proveedor'],
                take: 20
            });
            for (const c of comprasPendientes) {
                try {
                    await this.crearAsientoCompra(c, null);
                    c.asiento_contable_creado = true;
                    await this.compraRepository.save(c);
                    stats.compras++;
                }
                catch (e) {
                    console.error(`Error contabilizando compra ${c.numero}:`, e.message);
                    stats.errores++;
                }
            }
        }
        catch (error) {
        }
        const totalAsientos = await this.asientoRepository.count();
        if (totalAsientos === 0 && stats.facturas === 0 && stats.compras === 0) {
            await this.crearAsientoAperturaDemo();
            stats['demo'] = 1;
        }
        return { mensaje: 'Sincronización completada', stats };
    }
    async crearAsientoAperturaDemo() {
    }
    async onApplicationBootstrap() {
        this.assicurePlantillasBasicas().catch(err => console.error('Error seeding templates:', err));
    }
    async assicurePlantillasBasicas() {
        const ventaFactura = await this.plantillaRepository.findOne({ where: { codigo: 'VENTA_FACTURA' } });
        if (!ventaFactura) {
            console.log('Seeding plantilla VENTA_FACTURA...');
            const p = await this.plantillaRepository.save(this.plantillaRepository.create({
                codigo: 'VENTA_FACTURA',
                nombre: 'Venta de Facturación',
                descripcion: 'Asiento automático de Venta (Facturación)',
                origen: plantilla_asiento_entity_1.OrigenAsiento.VENTAS,
                activo: true
            }));
            const manager = this.plantillaRepository.manager;
            await manager.save(plantilla_detalle_entity_1.PlantillaDetalle, manager.create(plantilla_detalle_entity_1.PlantillaDetalle, {
                plantilla_id: p.id,
                cuenta_codigo: '@CLIENTE_CXC',
                tipo_movimiento: plantilla_detalle_entity_1.TipoMovimiento.DEBE,
                tipo_valor: plantilla_detalle_entity_1.TipoValor.TOTAL,
                porcentaje: 100,
                orden: 1,
                referencia_opcional: 'Factura {numero} - Clientes'
            }));
            await manager.save(plantilla_detalle_entity_1.PlantillaDetalle, manager.create(plantilla_detalle_entity_1.PlantillaDetalle, {
                plantilla_id: p.id,
                cuenta_codigo: '@VENTAS_BIENES',
                tipo_movimiento: plantilla_detalle_entity_1.TipoMovimiento.HABER,
                tipo_valor: plantilla_detalle_entity_1.TipoValor.SUBTOTAL_0,
                porcentaje: 100,
                orden: 2,
                referencia_opcional: 'Factura {numero} - Ventas'
            }));
            await manager.save(plantilla_detalle_entity_1.PlantillaDetalle, manager.create(plantilla_detalle_entity_1.PlantillaDetalle, {
                plantilla_id: p.id,
                cuenta_codigo: '@IVA_VENTAS',
                tipo_movimiento: plantilla_detalle_entity_1.TipoMovimiento.HABER,
                tipo_valor: plantilla_detalle_entity_1.TipoValor.IVA,
                porcentaje: 100,
                orden: 3,
                referencia_opcional: 'Factura {numero} - IVA'
            }));
        }
        const compraInv = await this.plantillaRepository.findOne({ where: { codigo: 'COMPRA_INVENTARIO' } });
        if (!compraInv) {
            console.log('Seeding plantilla COMPRA_INVENTARIO...');
            const p = await this.plantillaRepository.save(this.plantillaRepository.create({
                codigo: 'COMPRA_INVENTARIO',
                nombre: 'Compra de Inventario',
                descripcion: 'Asiento automático de Compra de Inventario',
                origen: plantilla_asiento_entity_1.OrigenAsiento.COMPRAS,
                activo: true
            }));
            const manager = this.plantillaRepository.manager;
            await manager.save(plantilla_detalle_entity_1.PlantillaDetalle, manager.create(plantilla_detalle_entity_1.PlantillaDetalle, {
                plantilla_id: p.id,
                cuenta_codigo: '@INVENTARIO',
                tipo_movimiento: plantilla_detalle_entity_1.TipoMovimiento.DEBE,
                tipo_valor: plantilla_detalle_entity_1.TipoValor.SUBTOTAL_0,
                porcentaje: 100,
                orden: 1,
                referencia_opcional: 'Compra {numero} - Inventario'
            }));
            await manager.save(plantilla_detalle_entity_1.PlantillaDetalle, manager.create(plantilla_detalle_entity_1.PlantillaDetalle, {
                plantilla_id: p.id,
                cuenta_codigo: '@IVA_COMPRAS',
                tipo_movimiento: plantilla_detalle_entity_1.TipoMovimiento.DEBE,
                tipo_valor: plantilla_detalle_entity_1.TipoValor.IVA,
                porcentaje: 100,
                orden: 2,
                referencia_opcional: 'Compra {numero} - IVA en Compras'
            }));
            await manager.save(plantilla_detalle_entity_1.PlantillaDetalle, manager.create(plantilla_detalle_entity_1.PlantillaDetalle, {
                plantilla_id: p.id,
                cuenta_codigo: '@PROVEEDOR_CXP',
                tipo_movimiento: plantilla_detalle_entity_1.TipoMovimiento.HABER,
                tipo_valor: plantilla_detalle_entity_1.TipoValor.TOTAL,
                porcentaje: 100,
                orden: 3,
                referencia_opcional: 'Compra {numero} - Cuentas por Pagar'
            }));
            await manager.save(plantilla_detalle_entity_1.PlantillaDetalle, manager.create(plantilla_detalle_entity_1.PlantillaDetalle, {
                plantilla_id: p.id,
                cuenta_codigo: '@RET_RENTA_POR_PAGAR',
                tipo_movimiento: plantilla_detalle_entity_1.TipoMovimiento.HABER,
                tipo_valor: plantilla_detalle_entity_1.TipoValor.RETENCION_RENTA,
                porcentaje: 100,
                orden: 4,
                referencia_opcional: 'Retención Renta - Compra {numero}'
            }));
            await manager.save(plantilla_detalle_entity_1.PlantillaDetalle, manager.create(plantilla_detalle_entity_1.PlantillaDetalle, {
                plantilla_id: p.id,
                cuenta_codigo: '@RET_IVA_POR_PAGAR',
                tipo_movimiento: plantilla_detalle_entity_1.TipoMovimiento.HABER,
                tipo_valor: plantilla_detalle_entity_1.TipoValor.RETENCION_IVA,
                porcentaje: 100,
                orden: 5,
                referencia_opcional: 'Retención IVA - Compra {numero}'
            }));
        }
    }
    async findAllAsientos() {
        return this.asientoRepository.find({
            relations: ['partidas', 'partidas.cuenta'],
            order: { fecha: 'DESC' },
        });
    }
    async findOneAsiento(id) {
        const asiento = await this.asientoRepository.findOne({
            where: { id },
            relations: ['partidas', 'partidas.cuenta'],
        });
        if (!asiento)
            throw new common_1.NotFoundException('Asiento no encontrado');
        return asiento;
    }
    async obtenerBalanceGeneral() {
        const cuentas = await this.cuentaRepository.find();
        return {
            activo: 0,
            pasivo: 0,
            patrimonio: 0,
            mensaje: 'Calculado desde ContabilidadService (Stub)'
        };
    }
    async obtenerResumen(fechaInicio, fechaFin) {
        const builder = this.asientoRepository.createQueryBuilder('asiento');
        if (fechaInicio && fechaFin) {
            builder.where('asiento.fecha BETWEEN :inicio AND :fin', { inicio: fechaInicio, fin: fechaFin });
        }
        const ingresos = await builder.clone()
            .where("asiento.tipo IN (:...tiposIngreso)", { tiposIngreso: ['INGRESOS', 'VENTA', 'INGRESO'] })
            .select("SUM(asiento.total_haber)", "total")
            .getRawOne();
        const gastos = await builder.clone()
            .where("asiento.tipo IN (:...tiposGasto)", { tiposGasto: ['GASTOS', 'COMPRA', 'GASTO'] })
            .select("SUM(asiento.total_debe)", "total")
            .getRawOne();
        const activos = await builder.clone()
            .where("asiento.tipo = :tipoApertura", { tipoApertura: 'APERTURA' })
            .select("SUM(asiento.total_debe)", "total")
            .getRawOne();
        const totalIngresos = parseFloat(ingresos?.total || '0');
        const totalGastos = parseFloat(gastos?.total || '0');
        const totalActivosApertura = parseFloat(activos?.total || '0');
        const utilidad = totalIngresos - totalGastos;
        return {
            ingresos: totalIngresos,
            gastos: totalGastos,
            utilidad: utilidad,
            activos: totalActivosApertura + totalIngresos,
            pasivos: totalGastos * 0.5,
            patrimonio: totalActivosApertura
        };
    }
};
exports.ContabilidadService = ContabilidadService;
exports.ContabilidadService = ContabilidadService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(asiento_contable_entity_1.AsientoContable)),
    __param(1, (0, typeorm_1.InjectRepository)(partida_contable_entity_1.PartidaContable)),
    __param(2, (0, typeorm_1.InjectRepository)(cuenta_contable_entity_1.CuentaContable)),
    __param(3, (0, typeorm_1.InjectRepository)(factura_entity_1.Factura)),
    __param(4, (0, typeorm_1.InjectRepository)(compra_entity_1.Compra)),
    __param(5, (0, typeorm_1.InjectRepository)(plantilla_asiento_entity_1.PlantillaAsiento)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        plantillas_service_1.PlantillasService])
], ContabilidadService);
//# sourceMappingURL=contabilidad.service.js.map