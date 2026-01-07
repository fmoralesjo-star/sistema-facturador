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
exports.EmpresaController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer = require("multer");
const path = require("path");
const empresa_service_1 = require("./empresa.service");
const create_empresa_dto_1 = require("./dto/create-empresa.dto");
const update_empresa_dto_1 = require("./dto/update-empresa.dto");
let EmpresaController = class EmpresaController {
    constructor(empresaService) {
        this.empresaService = empresaService;
    }
    create(createEmpresaDto) {
        return this.empresaService.create(createEmpresaDto);
    }
    findAll() {
        return this.empresaService.findAll();
    }
    findActive() {
        return this.empresaService.findActive();
    }
    findOne(id) {
        return this.empresaService.findOne(id);
    }
    update(id, updateEmpresaDto) {
        return this.empresaService.update(id, updateEmpresaDto);
    }
    remove(id) {
        return this.empresaService.remove(id);
    }
    activate(id) {
        return this.empresaService.activate(id);
    }
    deactivate(id) {
        return this.empresaService.deactivate(id);
    }
    uploadLogo(ruc, file) {
        return { success: true, message: 'Logo cargado exitosamente', filename: file.filename };
    }
};
exports.EmpresaController = EmpresaController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_empresa_dto_1.CreateEmpresaDto]),
    __metadata("design:returntype", void 0)
], EmpresaController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EmpresaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('activa'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EmpresaController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EmpresaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_empresa_dto_1.UpdateEmpresaDto]),
    __metadata("design:returntype", void 0)
], EmpresaController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EmpresaController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/activar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EmpresaController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)(':id/desactivar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EmpresaController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Post)(':ruc/logo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: multer.diskStorage({
            destination: './uploads/logos',
            filename: (req, file, cb) => {
                const ruc = req.params.ruc;
                const ext = path.extname(file.originalname);
                cb(null, `${ruc}${ext}`);
            },
        }),
    })),
    __param(0, (0, common_1.Param)('ruc')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EmpresaController.prototype, "uploadLogo", null);
exports.EmpresaController = EmpresaController = __decorate([
    (0, common_1.Controller)('empresa'),
    __metadata("design:paramtypes", [empresa_service_1.EmpresaService])
], EmpresaController);
//# sourceMappingURL=empresa.controller.js.map