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
var CircuitBreakerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const configuracion_entity_1 = require("../../admin/entities/configuracion.entity");
let CircuitBreakerService = CircuitBreakerService_1 = class CircuitBreakerService {
    constructor(configuracionRepository) {
        this.configuracionRepository = configuracionRepository;
        this.logger = new common_1.Logger(CircuitBreakerService_1.name);
        this.failureCount = 0;
        this.FAILURE_THRESHOLD = 5;
        this.RESET_TIMEOUT = 300000;
        this.lastFailureTime = 0;
    }
    async registrarFallo(error) {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        this.logger.warn(`Circuit Breaker: Fallo detectado. Contador: ${this.failureCount}/${this.FAILURE_THRESHOLD}`);
        if (this.failureCount >= this.FAILURE_THRESHOLD) {
            await this.activarContingencia();
        }
    }
    async registrarExito() {
        if (this.failureCount > 0) {
            this.logger.log('Circuit Breaker: Éxito detectado. Reseteando contador de fallos.');
            this.failureCount = 0;
        }
    }
    async activarContingencia() {
        this.logger.error('🚨 UMBRAL DE FALLOS SUPERADO. ACTIVANDO MODO CONTINGENCIA AUTOMÁTICO 🚨');
        try {
            let config = await this.configuracionRepository.findOne({
                where: { clave: 'sri_modo_contingencia' }
            });
            if (!config) {
                config = this.configuracionRepository.create({
                    clave: 'sri_modo_contingencia',
                    grupo: 'EMISION',
                    tipo: 'boolean',
                    descripcion: 'Modo Contingencia SRI (Activado Automáticamente)'
                });
            }
            if (config.valor === 'true') {
                return;
            }
            config.valor = 'true';
            await this.configuracionRepository.save(config);
            this.logger.warn('Modo contingencia persistido en base de datos.');
        }
        catch (error) {
            this.logger.error('Error al intentar activar contingencia en BD:', error);
        }
    }
    async isContingenciaActiva() {
        try {
            const config = await this.configuracionRepository.findOne({
                where: { clave: 'sri_modo_contingencia' }
            });
            return config?.valor === 'true';
        }
        catch (error) {
            return false;
        }
    }
};
exports.CircuitBreakerService = CircuitBreakerService;
exports.CircuitBreakerService = CircuitBreakerService = CircuitBreakerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(configuracion_entity_1.Configuracion)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CircuitBreakerService);
//# sourceMappingURL=circuit-breaker.service.js.map