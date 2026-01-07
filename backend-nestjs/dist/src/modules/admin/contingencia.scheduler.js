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
var ContingenciaScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContingenciaScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const contingencia_service_1 = require("./contingencia.service");
let ContingenciaScheduler = ContingenciaScheduler_1 = class ContingenciaScheduler {
    constructor(contingenciaService) {
        this.contingenciaService = contingenciaService;
        this.logger = new common_1.Logger(ContingenciaScheduler_1.name);
    }
    async procesarColaAutomaticamente() {
        this.logger.log('⏰ Ejecutando job de procesamiento de cola de contingencia...');
        try {
            const resultado = await this.contingenciaService.procesarColaContingencia();
            if (resultado.procesados > 0) {
                this.logger.log(`✅ Job completado: ${resultado.exitosos} exitosos, ${resultado.fallidos} fallidos de ${resultado.procesados} procesados`);
            }
        }
        catch (error) {
            this.logger.error(`❌ Error en job de contingencia: ${error.message}`);
        }
    }
};
exports.ContingenciaScheduler = ContingenciaScheduler;
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *', {
        name: 'procesar-cola-contingencia',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContingenciaScheduler.prototype, "procesarColaAutomaticamente", null);
exports.ContingenciaScheduler = ContingenciaScheduler = ContingenciaScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [contingencia_service_1.ContingenciaService])
], ContingenciaScheduler);
//# sourceMappingURL=contingencia.scheduler.js.map