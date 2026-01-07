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
exports.ImpuestosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sri_retencion_entity_1 = require("../entities/sri-retencion.entity");
let ImpuestosService = class ImpuestosService {
    constructor(retencionesRepository) {
        this.retencionesRepository = retencionesRepository;
    }
    async calcularRetencionRenta(subtotal, tipoBien, proveedor) {
        if (proveedor.tipo_contribuyente === 'RIMPE_EMPRENDEDOR') {
            const codigo = '343';
            return this.buscarYCalcular(codigo, subtotal);
        }
        if (proveedor.tipo_contribuyente === 'RIMPE_NEGOCIO_POPULAR') {
            const codigo = '332';
            return this.buscarYCalcular(codigo, subtotal);
        }
        if (proveedor.tipo_contribuyente === 'CONTRIBUYENTE_ESPECIAL') {
        }
        let codigoSugerido = '312';
        switch (tipoBien) {
            case 'BIEN':
                codigoSugerido = '312';
                break;
            case 'SERVICIO':
                if (proveedor.tipo_contribuyente === 'PERSONA_NATURAL') {
                    codigoSugerido = '303';
                }
                else {
                    codigoSugerido = '3440';
                }
                break;
            case 'TRANSPORTE':
                codigoSugerido = '311';
                break;
            case 'CONSTRUCCION':
                codigoSugerido = '312A';
                break;
        }
        return this.buscarYCalcular(codigoSugerido, subtotal);
    }
    async calcularRetencionIva(iva, tipoBien, proveedor) {
        if (iva === 0)
            return { codigo: '0', porcentaje: 0, valorRetenido: 0, id: 0 };
        let codigoSugerido = '9';
        if (tipoBien === 'SERVICIO') {
            codigoSugerido = '10';
        }
        if (proveedor.tipo_contribuyente === 'CONTRIBUYENTE_ESPECIAL') {
            codigoSugerido = '111';
        }
        return this.buscarYCalcular(codigoSugerido, iva, sri_retencion_entity_1.TipoRetencion.IVA);
    }
    async onModuleInit() {
        await this.inicializarMatriz();
    }
    async inicializarMatriz() {
        const count = await this.retencionesRepository.count();
        if (count > 0)
            return;
        const retenciones = [
            { codigo: '312', descripcion: 'Transferencia de bienes muebles de naturaleza corporal', porcentaje: 1.75, tipo: sri_retencion_entity_1.TipoRetencion.RENTA },
            { codigo: '303', descripcion: 'Honorarios profesionales y demás pagos por servicios (PN)', porcentaje: 10.00, tipo: sri_retencion_entity_1.TipoRetencion.RENTA },
            { codigo: '3440', descripcion: 'Otras compras de bienes y servicios no sujetas a retención', porcentaje: 2.75, tipo: sri_retencion_entity_1.TipoRetencion.RENTA },
            { codigo: '343', descripcion: '1% Rimpe Emprendedor (Bienes y Servicios)', porcentaje: 1.00, tipo: sri_retencion_entity_1.TipoRetencion.RENTA },
            { codigo: '332', descripcion: '0% Rimpe Negocio Popular (Notas de Venta)', porcentaje: 0.00, tipo: sri_retencion_entity_1.TipoRetencion.RENTA },
            { codigo: '311', descripcion: 'Servicios de transporte privado de pasajeros o carga', porcentaje: 1.00, tipo: sri_retencion_entity_1.TipoRetencion.RENTA },
            { codigo: '312A', descripcion: 'Sector Construcción', porcentaje: 1.75, tipo: sri_retencion_entity_1.TipoRetencion.RENTA },
            { codigo: '9', descripcion: 'Retención IVA 30% (Bienes)', porcentaje: 30.00, tipo: sri_retencion_entity_1.TipoRetencion.IVA },
            { codigo: '10', descripcion: 'Retención IVA 70% (Servicios)', porcentaje: 70.00, tipo: sri_retencion_entity_1.TipoRetencion.IVA },
            { codigo: '111', descripcion: 'Retención IVA 100% (Arriendos/Honorarios)', porcentaje: 100.00, tipo: sri_retencion_entity_1.TipoRetencion.IVA },
            { codigo: '1', descripcion: 'Retención IVA 10% (Entre Contribuyentes Especiales)', porcentaje: 10.00, tipo: sri_retencion_entity_1.TipoRetencion.IVA },
            { codigo: '0', descripcion: 'Sin Retención', porcentaje: 0.00, tipo: sri_retencion_entity_1.TipoRetencion.RENTA },
        ];
        for (const r of retenciones) {
            await this.retencionesRepository.save(this.retencionesRepository.create(r));
        }
        console.log('✅ Matriz de Retenciones SRI 2026 Inicializada');
    }
    async buscarYCalcular(codigo, baseImponible, tipo = sri_retencion_entity_1.TipoRetencion.RENTA) {
        const retencion = await this.retencionesRepository.findOne({ where: { codigo, tipo } });
        if (!retencion) {
            console.warn(`Código de retención ${codigo} no encontrado en base de datos.`);
            return { codigo, porcentaje: 0, valorRetenido: 0, id: 0 };
        }
        const valorRetenido = parseFloat((baseImponible * (Number(retencion.porcentaje) / 100)).toFixed(2));
        return {
            id: retencion.id,
            codigo: retencion.codigo,
            porcentaje: Number(retencion.porcentaje),
            valorRetenido
        };
    }
};
exports.ImpuestosService = ImpuestosService;
exports.ImpuestosService = ImpuestosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sri_retencion_entity_1.SriRetencion)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ImpuestosService);
//# sourceMappingURL=impuestos.service.js.map