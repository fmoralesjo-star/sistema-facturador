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
exports.ConciliacionesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conciliacion_bancaria_entity_1 = require("./entities/conciliacion-bancaria.entity");
const movimiento_bancario_extracto_entity_1 = require("./entities/movimiento-bancario-extracto.entity");
const bancos_service_1 = require("../bancos/bancos.service");
const contabilidad_service_1 = require("../contabilidad/contabilidad.service");
const conciliacion_ia_service_1 = require("./conciliacion-ia.service");
let ConciliacionesService = class ConciliacionesService {
    constructor(conciliacionRepository, extractoRepository, bancosService, contabilidadService, conciliacionIAService) {
        this.conciliacionRepository = conciliacionRepository;
        this.extractoRepository = extractoRepository;
        this.bancosService = bancosService;
        this.contabilidadService = contabilidadService;
        this.conciliacionIAService = conciliacionIAService;
    }
    async create(createConciliacionDto) {
        const conciliacion = this.conciliacionRepository.create({
            ...createConciliacionDto,
            fecha: new Date(createConciliacionDto.fecha),
            fecha_valor: createConciliacionDto.fecha_valor ? new Date(createConciliacionDto.fecha_valor) : null,
        });
        const conciliacionGuardada = await this.conciliacionRepository.save(conciliacion);
        if (createConciliacionDto.tipo === 'DEPOSITO' || createConciliacionDto.tipo === 'TRANSFERENCIA_ENTRADA') {
            await this.bancosService.actualizarSaldo(createConciliacionDto.banco_id, createConciliacionDto.monto, 'suma');
        }
        else if (createConciliacionDto.tipo === 'RETIRO' || createConciliacionDto.tipo === 'TRANSFERENCIA_SALIDA') {
            await this.bancosService.actualizarSaldo(createConciliacionDto.banco_id, createConciliacionDto.monto, 'resta');
        }
        try {
            if (createConciliacionDto.tipo === 'DEPOSITO' || createConciliacionDto.tipo === 'TRANSFERENCIA_ENTRADA') {
                await this.contabilidadService.crearAsientoTransferencia({
                    origen: 'CLIENTES',
                    destino: 'BANCOS',
                    monto: createConciliacionDto.monto,
                    motivo: createConciliacionDto.descripcion || 'Depósito bancario',
                    fecha: conciliacionGuardada.fecha,
                });
            }
            else if (createConciliacionDto.tipo === 'RETIRO' || createConciliacionDto.tipo === 'TRANSFERENCIA_SALIDA') {
                await this.contabilidadService.crearAsientoTransferencia({
                    origen: 'BANCOS',
                    destino: 'Caja General',
                    monto: createConciliacionDto.monto,
                    motivo: createConciliacionDto.descripcion || 'Retiro bancario',
                    fecha: conciliacionGuardada.fecha,
                });
            }
        }
        catch (error) {
            console.error('Error al crear asiento contable para conciliación:', error);
        }
        return conciliacionGuardada;
    }
    async findAll() {
        return this.conciliacionRepository.find({
            relations: ['banco', 'factura'],
            order: { fecha: 'DESC' },
        });
    }
    async findByBanco(bancoId) {
        return this.conciliacionRepository.find({
            where: { banco_id: bancoId },
            relations: ['banco', 'factura'],
            order: { fecha: 'DESC' },
        });
    }
    async findByFactura(facturaId) {
        return this.conciliacionRepository.find({
            where: { factura_id: facturaId },
            relations: ['banco', 'factura'],
        });
    }
    async findAllExtracto(bancoId) {
        return this.extractoRepository.find({
            where: { banco_id: bancoId },
            order: { fecha: 'ASC' }
        });
    }
    async findOne(id) {
        return this.conciliacionRepository.findOne({
            where: { id },
            relations: ['banco', 'factura'],
        });
    }
    async update(id, updateData) {
        await this.conciliacionRepository.update(id, {
            ...updateData,
            fecha: updateData.fecha ? new Date(updateData.fecha) : undefined,
            fecha_valor: updateData.fecha_valor ? new Date(updateData.fecha_valor) : undefined,
        });
        return this.findOne(id);
    }
    async conciliar(id) {
        await this.conciliacionRepository.update(id, {
            conciliado: true,
            fecha_conciliacion: new Date(),
        });
        return this.findOne(id);
    }
    async remove(id) {
        await this.conciliacionRepository.delete(id);
    }
    async sincronizarConFactura(facturaId, pagos) {
        for (const pago of pagos) {
            let tipoMovimiento = 'DEPOSITO';
            if (pago.metodoPago === 'TRANSFERENCIA' || pago.metodoPago === 'TRANSFERENCIA_ENTRADA') {
                tipoMovimiento = 'TRANSFERENCIA_ENTRADA';
            }
            else if (pago.metodoPago === 'TARJETA_DEBITO' || pago.metodoPago === 'TARJETA_CREDITO') {
                tipoMovimiento = 'TARJETA';
            }
            else if (pago.metodoPago === 'EFECTIVO') {
                continue;
            }
            let bancoId = pago.banco_id;
            if (!bancoId) {
                const bancos = await this.bancosService.findAll();
                if (bancos.length > 0) {
                    bancoId = bancos[0].id;
                }
                else {
                    continue;
                }
            }
            await this.create({
                banco_id: bancoId,
                factura_id: facturaId,
                fecha: new Date().toISOString(),
                monto: pago.monto,
                tipo: tipoMovimiento,
                forma_pago: pago.codigo || pago.formaPago,
                metodo_pago: pago.metodoPago,
                descripcion: `Pago de factura - ${pago.tipoPago || pago.descripcion || 'Pago registrado'}`,
                conciliado: false,
            });
        }
    }
    async importarExtracto(bancoId, datosCSV) {
        const lineas = datosCSV.split('\n');
        let importados = 0;
        let duplicados = 0;
        const startIndex = lineas[0].toLowerCase().includes('fecha') ? 1 : 0;
        for (let i = startIndex; i < lineas.length; i++) {
            const linea = lineas[i].trim();
            if (!linea)
                continue;
            const [fechaStr, descripcion, montoStr, referencia] = linea.split(',');
            if (!fechaStr || !montoStr)
                continue;
            const monto = parseFloat(montoStr);
            const fecha = new Date(fechaStr);
            const existe = await this.extractoRepository.findOne({
                where: {
                    banco_id: bancoId,
                    fecha: fecha,
                    monto: monto,
                    referencia: referencia || undefined
                }
            });
            if (existe) {
                duplicados++;
                continue;
            }
            const movimiento = this.extractoRepository.create({
                banco_id: bancoId,
                fecha: fecha,
                descripcion: descripcion || 'Movimiento importado',
                monto: monto,
                referencia: referencia || null,
                conciliado: false
            });
            await this.extractoRepository.save(movimiento);
            importados++;
        }
        await this.conciliarAutomatico(bancoId);
        return { importados, duplicados };
    }
    async conciliarAutomatico(bancoId) {
        const movimientosExtracto = await this.extractoRepository.find({
            where: { banco_id: bancoId, conciliado: false }
        });
        const movimientosSistema = await this.conciliacionRepository.find({
            where: { banco_id: bancoId, conciliado: false }
        });
        let conciliadosCount = 0;
        for (const movExtracto of movimientosExtracto) {
            const match = movimientosSistema.find(movSistema => {
                const diffDias = Math.abs((new Date(movSistema.fecha).getTime() - new Date(movExtracto.fecha).getTime()) / (1000 * 3600 * 24));
                return Math.abs(Number(movSistema.monto) - Number(movExtracto.monto)) < 0.01 && diffDias <= 2;
            });
            if (match) {
                match.conciliado = true;
                match.fecha_conciliacion = new Date();
                match.referencia = match.referencia || movExtracto.referencia;
                movExtracto.conciliado = true;
                movExtracto.conciliacion_bancaria_id = match.id;
                await this.conciliacionRepository.save(match);
                await this.extractoRepository.save(movExtracto);
                conciliadosCount++;
                const index = movimientosSistema.indexOf(match);
                if (index > -1)
                    movimientosSistema.splice(index, 1);
            }
        }
        return conciliadosCount;
    }
    async procesarExtractoIA(data, bancoId) {
        return await this.conciliacionIAService.procesarExtracto(data, bancoId);
    }
    async getPendientesIA(bancoId) {
        return await this.conciliacionIAService.getPendientes(bancoId);
    }
    async getSugerenciasIA(transaccionId) {
        return await this.conciliacionIAService.sugerirEmparejamientos(transaccionId);
    }
    async confirmarMatchIA(transaccionId, conciliacionId) {
        return await this.conciliacionIAService.confirmarEmparejamiento(transaccionId, conciliacionId);
    }
    async getEstadisticasIA(bancoId) {
        return await this.conciliacionIAService.getEstadisticas(bancoId);
    }
};
exports.ConciliacionesService = ConciliacionesService;
exports.ConciliacionesService = ConciliacionesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conciliacion_bancaria_entity_1.ConciliacionBancaria)),
    __param(1, (0, typeorm_1.InjectRepository)(movimiento_bancario_extracto_entity_1.MovimientoBancarioExtracto)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        bancos_service_1.BancosService,
        contabilidad_service_1.ContabilidadService,
        conciliacion_ia_service_1.ConciliacionIAService])
], ConciliacionesService);
//# sourceMappingURL=conciliaciones.service.js.map