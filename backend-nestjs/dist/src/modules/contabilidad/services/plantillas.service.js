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
exports.PlantillasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const plantilla_asiento_entity_1 = require("../entities/plantilla-asiento.entity");
const plantilla_detalle_entity_1 = require("../entities/plantilla-detalle.entity");
const partida_contable_entity_1 = require("../entities/partida-contable.entity");
const cuenta_contable_entity_1 = require("../entities/cuenta-contable.entity");
let PlantillasService = class PlantillasService {
    constructor(plantillaRepository, cuentaRepository) {
        this.plantillaRepository = plantillaRepository;
        this.cuentaRepository = cuentaRepository;
    }
    async procesarPlantilla(codigoPlantilla, datos) {
        const plantilla = await this.plantillaRepository.findOne({
            where: { codigo: codigoPlantilla, activo: true },
            relations: ['detalles']
        });
        if (!plantilla) {
            console.warn(`Plantilla ${codigoPlantilla} no encontrada. Saltando generación.`);
            return [];
        }
        const partidas = [];
        const detalles = plantilla.detalles.sort((a, b) => a.orden - b.orden);
        const codigosCuentas = detalles
            .filter(d => !d.cuenta_codigo.startsWith('@'))
            .map(d => d.cuenta_codigo);
        for (const detalle of detalles) {
            const monto = this.calcularValor(detalle, datos);
            if (monto === 0)
                continue;
            const cuentaId = await this.resolverCuenta(detalle.cuenta_codigo, datos);
            if (!cuentaId) {
                console.warn(`No se pudo resolver cuenta para código ${detalle.cuenta_codigo}`);
                continue;
            }
            const partida = new partida_contable_entity_1.PartidaContable();
            partida.cuenta_id = cuentaId;
            partida.debe = detalle.tipo_movimiento === plantilla_detalle_entity_1.TipoMovimiento.DEBE ? monto : 0;
            partida.haber = detalle.tipo_movimiento === plantilla_detalle_entity_1.TipoMovimiento.HABER ? monto : 0;
            if (detalle.cuenta_codigo === '@CLIENTE_CXC' || detalle.cuenta_codigo.includes('CLIENTE')) {
                partida.tercero_id = datos.cliente_id;
                partida.tercero_tipo = 'CLIENTE';
            }
            else if (detalle.cuenta_codigo.includes('PROVEEDOR')) {
                partida.tercero_id = datos.proveedor_id;
                partida.tercero_tipo = 'PROVEEDOR';
            }
            partidas.push(partida);
        }
        return partidas;
    }
    calcularValor(detalle, datos) {
        let valorBase = 0;
        switch (detalle.tipo_valor) {
            case plantilla_detalle_entity_1.TipoValor.TOTAL:
                valorBase = datos.total || 0;
                break;
            case plantilla_detalle_entity_1.TipoValor.SUBTOTAL_0:
            case plantilla_detalle_entity_1.TipoValor.SUBTOTAL_15:
                valorBase = datos.subtotal || 0;
                break;
            case plantilla_detalle_entity_1.TipoValor.IVA:
                valorBase = datos.iva || 0;
                break;
            case plantilla_detalle_entity_1.TipoValor.DESCUENTO:
                valorBase = datos.descuento || 0;
                break;
            case plantilla_detalle_entity_1.TipoValor.VALOR_FIJO:
                valorBase = 1;
                break;
            case plantilla_detalle_entity_1.TipoValor.RETENCION_RENTA:
                valorBase = datos.retencion_renta || 0;
                break;
            case plantilla_detalle_entity_1.TipoValor.RETENCION_IVA:
                valorBase = datos.retencion_iva || 0;
                break;
        }
        return parseFloat((valorBase * (detalle.porcentaje / 100)).toFixed(2));
    }
    async resolverCuenta(codigo, datos) {
        if (!codigo.startsWith('@')) {
            const cuenta = await this.cuentaRepository.findOne({ where: { codigo } });
            return cuenta ? cuenta.id : 0;
        }
        let codigoDestino = '';
        switch (codigo) {
            case '@CLIENTE_CXC':
                codigoDestino = '1.1.02.01';
                break;
            case '@VENTAS_BIENES':
                codigoDestino = '4.1.01.01';
                break;
            case '@VENTAS_SERVICIOS':
                codigoDestino = '4.1.02.01';
                break;
            case '@IVA_VENTAS':
                codigoDestino = '2.1.02.01';
                break;
            case '@CAJA_GENERAL':
                codigoDestino = '1.1.01.01';
                break;
            case '@BANCOS':
                codigoDestino = '1.1.01.02';
                break;
            case '@INVENTARIO':
                codigoDestino = '1.1.03.01';
                break;
            case '@PROVEEDOR_CXP':
                codigoDestino = '2.1.01.01';
                break;
            case '@GASTO_COMPRA':
                codigoDestino = '5.1.01.01';
                break;
            case '@IVA_COMPRAS':
                codigoDestino = '1.1.04.01';
                break;
            case '@RET_RENTA_POR_PAGAR':
                codigoDestino = '2.1.02.02';
                break;
            case '@RET_IVA_POR_PAGAR':
                codigoDestino = '2.1.02.01';
                codigoDestino = '2.1.02.02';
                break;
            default:
                return 0;
        }
        const cuenta = await this.cuentaRepository.findOne({ where: { codigo: codigoDestino } });
        if (!cuenta) {
            const parts = codigoDestino.split('.');
            if (parts.length > 2) {
                const parentCode = parts.slice(0, parts.length - 1).join('.');
                const parent = await this.cuentaRepository.findOne({ where: { codigo: parentCode } });
                if (parent)
                    return parent.id;
            }
            console.warn(`No se encontró cuenta para comodín ${codigo} -> ${codigoDestino}`);
            return 0;
        }
        return cuenta.id;
    }
};
exports.PlantillasService = PlantillasService;
exports.PlantillasService = PlantillasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(plantilla_asiento_entity_1.PlantillaAsiento)),
    __param(1, (0, typeorm_1.InjectRepository)(cuenta_contable_entity_1.CuentaContable)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PlantillasService);
//# sourceMappingURL=plantillas.service.js.map