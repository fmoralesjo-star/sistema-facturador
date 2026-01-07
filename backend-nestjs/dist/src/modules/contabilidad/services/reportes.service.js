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
exports.ReportesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const partida_contable_entity_1 = require("../entities/partida-contable.entity");
const cuenta_contable_entity_1 = require("../entities/cuenta-contable.entity");
const asiento_contable_entity_1 = require("../entities/asiento-contable.entity");
let ReportesService = class ReportesService {
    constructor(partidaRepository, cuentaRepository, asientoRepository) {
        this.partidaRepository = partidaRepository;
        this.cuentaRepository = cuentaRepository;
        this.asientoRepository = asientoRepository;
    }
    async generarBalanceGeneral(fechaCorte) {
        const fecha = fechaCorte || new Date();
        const activos = await this.obtenerSaldosPorTipo('ACTIVO', fecha);
        const pasivos = await this.obtenerSaldosPorTipo('PASIVO', fecha);
        const patrimonio = await this.obtenerSaldosPorTipo('PATRIMONIO', fecha);
        const totalActivos = activos.reduce((sum, c) => sum + c.saldo, 0);
        const totalPasivos = pasivos.reduce((sum, c) => sum + c.saldo, 0);
        const totalPatrimonio = patrimonio.reduce((sum, c) => sum + c.saldo, 0);
        const totalPasivoPatrimonio = totalPasivos + totalPatrimonio;
        return {
            activos: {
                total: totalActivos,
                cuentas: activos,
            },
            pasivos: {
                total: totalPasivos,
                cuentas: pasivos,
            },
            patrimonio: {
                total: totalPatrimonio,
                cuentas: patrimonio,
            },
            ecuacion: {
                activo_total: totalActivos,
                pasivo_patrimonio_total: totalPasivoPatrimonio,
                balanceado: Math.abs(totalActivos - totalPasivoPatrimonio) < 0.01,
                diferencia: totalActivos - totalPasivoPatrimonio,
            },
        };
    }
    async generarEstadoPerdidasGanancias(fechaInicio, fechaFin) {
        const ingresos = await this.obtenerSaldosPorTipoYFecha('INGRESO', fechaInicio, fechaFin);
        const costos = await this.obtenerSaldosPorTipoYFecha('COSTO', fechaInicio, fechaFin);
        const gastos = await this.obtenerSaldosPorTipoYFecha('EGRESO', fechaInicio, fechaFin);
        const totalIngresos = ingresos.reduce((sum, c) => sum + c.saldo, 0);
        const totalCostos = costos.reduce((sum, c) => sum + c.saldo, 0);
        const totalGastos = gastos.reduce((sum, c) => sum + c.saldo, 0);
        return {
            ingresos: {
                total: totalIngresos,
                cuentas: ingresos,
            },
            costos: {
                total: totalCostos,
                cuentas: costos,
            },
            gastos: {
                total: totalGastos,
                cuentas: gastos,
            },
            utilidad_bruta: totalIngresos - totalCostos,
            utilidad_neta: totalIngresos - totalCostos - totalGastos,
        };
    }
    async generarLibroMayor(cuentaId, fechaInicio, fechaFin) {
        const cuenta = await this.cuentaRepository.findOne({
            where: { id: cuentaId },
        });
        if (!cuenta) {
            throw new Error(`Cuenta con ID ${cuentaId} no encontrada`);
        }
        let query = this.partidaRepository
            .createQueryBuilder('partida')
            .innerJoin('partida.asiento', 'asiento')
            .where('partida.cuenta_id = :cuentaId', { cuentaId })
            .orderBy('asiento.fecha', 'ASC')
            .addOrderBy('asiento.id', 'ASC');
        if (fechaInicio) {
            query = query.andWhere('asiento.fecha >= :fechaInicio', { fechaInicio });
        }
        if (fechaFin) {
            query = query.andWhere('asiento.fecha <= :fechaFin', { fechaFin });
        }
        const partidas = await query
            .select([
            'partida.id',
            'partida.debe',
            'partida.haber',
            'partida.descripcion',
            'asiento.fecha',
            'asiento.numero_asiento',
            'asiento.descripcion',
        ])
            .getRawMany();
        let saldoInicial = 0;
        if (fechaInicio) {
            const saldoAnterior = await this.partidaRepository
                .createQueryBuilder('partida')
                .innerJoin('partida.asiento', 'asiento')
                .where('partida.cuenta_id = :cuentaId', { cuentaId })
                .andWhere('asiento.fecha < :fechaInicio', { fechaInicio })
                .select('SUM(partida.debe)', 'total_debe')
                .addSelect('SUM(partida.haber)', 'total_haber')
                .getRawOne();
            const debeAnterior = parseFloat(saldoAnterior?.total_debe || 0);
            const haberAnterior = parseFloat(saldoAnterior?.total_haber || 0);
            if (cuenta.tipo === 'ACTIVO' ||
                cuenta.tipo === 'COSTO' ||
                cuenta.tipo === 'EGRESO') {
                saldoInicial = debeAnterior - haberAnterior;
            }
            else {
                saldoInicial = haberAnterior - debeAnterior;
            }
        }
        let saldoAcumulado = saldoInicial;
        const movimientos = partidas.map((partida) => {
            const debe = parseFloat(partida.partida_debe || 0);
            const haber = parseFloat(partida.partida_haber || 0);
            if (cuenta.tipo === 'ACTIVO' ||
                cuenta.tipo === 'COSTO' ||
                cuenta.tipo === 'EGRESO') {
                saldoAcumulado = saldoAcumulado + debe - haber;
            }
            else {
                saldoAcumulado = saldoAcumulado - debe + haber;
            }
            return {
                fecha: partida.asiento_fecha,
                numero_asiento: partida.asiento_numero_asiento,
                descripcion: partida.partida_descripcion || partida.asiento_descripcion,
                debe,
                haber,
                saldo_acumulado: saldoAcumulado,
            };
        });
        return {
            cuenta_id: cuenta.id,
            codigo: cuenta.codigo,
            nombre: cuenta.nombre,
            tipo: cuenta.tipo,
            saldo_inicial: saldoInicial,
            movimientos,
            saldo_final: saldoAcumulado,
        };
    }
    async obtenerSaldosPorTipo(tipo, fechaCorte) {
        const cuentas = await this.cuentaRepository.find({
            where: { tipo, activa: true },
            order: { codigo: 'ASC' },
        });
        const saldos = await Promise.all(cuentas.map(async (cuenta) => {
            const resultado = await this.partidaRepository
                .createQueryBuilder('partida')
                .innerJoin('partida.asiento', 'asiento')
                .where('partida.cuenta_id = :cuentaId', { cuentaId: cuenta.id })
                .andWhere('asiento.fecha <= :fechaCorte', { fechaCorte })
                .select('SUM(partida.debe)', 'total_debe')
                .addSelect('SUM(partida.haber)', 'total_haber')
                .getRawOne();
            const totalDebe = parseFloat(resultado?.total_debe || 0);
            const totalHaber = parseFloat(resultado?.total_haber || 0);
            let saldo = 0;
            if (tipo === 'ACTIVO' || tipo === 'COSTO' || tipo === 'EGRESO') {
                saldo = totalDebe - totalHaber;
            }
            else {
                saldo = totalHaber - totalDebe;
            }
            return {
                codigo: cuenta.codigo,
                nombre: cuenta.nombre,
                saldo,
            };
        }));
        return saldos.filter((s) => Math.abs(s.saldo) > 0.01);
    }
    async obtenerSaldosPorTipoYFecha(tipo, fechaInicio, fechaFin) {
        const cuentas = await this.cuentaRepository.find({
            where: { tipo, activa: true },
            order: { codigo: 'ASC' },
        });
        const saldos = await Promise.all(cuentas.map(async (cuenta) => {
            const resultado = await this.partidaRepository
                .createQueryBuilder('partida')
                .innerJoin('partida.asiento', 'asiento')
                .where('partida.cuenta_id = :cuentaId', { cuentaId: cuenta.id })
                .andWhere('asiento.fecha >= :fechaInicio', { fechaInicio })
                .andWhere('asiento.fecha <= :fechaFin', { fechaFin })
                .select('SUM(partida.debe)', 'total_debe')
                .addSelect('SUM(partida.haber)', 'total_haber')
                .getRawOne();
            const totalDebe = parseFloat(resultado?.total_debe || 0);
            const totalHaber = parseFloat(resultado?.total_haber || 0);
            let saldo = 0;
            if (tipo === 'ACTIVO' || tipo === 'COSTO' || tipo === 'EGRESO') {
                saldo = totalDebe - totalHaber;
            }
            else {
                saldo = totalHaber - totalDebe;
            }
            return {
                codigo: cuenta.codigo,
                nombre: cuenta.nombre,
                saldo,
            };
        }));
        return saldos.filter((s) => Math.abs(s.saldo) > 0.01);
    }
    async obtenerCuentasParaLibroMayor() {
        const cuentas = await this.cuentaRepository.find({
            where: { permite_movimiento: true },
            order: { codigo: 'ASC' },
        });
        return cuentas.map((c) => ({
            id: c.id,
            codigo: c.codigo,
            nombre: c.nombre,
            tipo: c.tipo,
        }));
    }
};
exports.ReportesService = ReportesService;
exports.ReportesService = ReportesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(partida_contable_entity_1.PartidaContable)),
    __param(1, (0, typeorm_1.InjectRepository)(cuenta_contable_entity_1.CuentaContable)),
    __param(2, (0, typeorm_1.InjectRepository)(asiento_contable_entity_1.AsientoContable)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportesService);
//# sourceMappingURL=reportes.service.js.map