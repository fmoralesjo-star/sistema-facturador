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
exports.ProductosController = void 0;
const common_1 = require("@nestjs/common");
const productos_service_1 = require("./productos.service");
const useFirestore = process.env.USE_FIRESTORE === 'true';
let ProductosController = class ProductosController {
    constructor(productosService) {
        this.productosService = productosService;
    }
    findAll(codigo, codBarras, sku) {
        if (codigo || codBarras || sku) {
            return this.productosService.findByCodigoOrBarrasOrSku(codigo, codBarras, sku);
        }
        return this.productosService.findAll();
    }
    crearProductoEjemplo() {
        return this.productosService.crearProductoEjemplo();
    }
    crearProductosMasivos(productosDto) {
        return this.productosService.crearProductosMasivos(productosDto);
    }
    create(createDto) {
        return this.productosService.create(createDto);
    }
    findOne(id) {
        const idStr = useFirestore ? String(id) : Number(id);
        return this.productosService.findOne(idStr);
    }
    update(id, updateDto) {
        const idStr = useFirestore ? String(id) : Number(id);
        return this.productosService.update(idStr, updateDto);
    }
    remove(id) {
        const idStr = useFirestore ? String(id) : Number(id);
        return this.productosService.remove(idStr);
    }
};
exports.ProductosController = ProductosController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('codigo')),
    __param(1, (0, common_1.Query)('cod_barras')),
    __param(2, (0, common_1.Query)('sku')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ProductosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('ejemplo/prenda'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductosController.prototype, "crearProductoEjemplo", null);
__decorate([
    (0, common_1.Post)('masivo'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], ProductosController.prototype, "crearProductosMasivos", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [productos_service_1.CreateProductoDto]),
    __metadata("design:returntype", void 0)
], ProductosController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, productos_service_1.UpdateProductoDto]),
    __metadata("design:returntype", void 0)
], ProductosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductosController.prototype, "remove", null);
exports.ProductosController = ProductosController = __decorate([
    (0, common_1.Controller)('productos'),
    __param(0, (0, common_1.Inject)('ProductosService')),
    __metadata("design:paramtypes", [Object])
], ProductosController);
//# sourceMappingURL=productos.controller.js.map