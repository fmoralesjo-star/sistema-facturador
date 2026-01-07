"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductosModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const productos_service_1 = require("./productos.service");
const productos_firestore_service_1 = require("./productos-firestore.service");
const productos_controller_1 = require("./productos.controller");
const producto_entity_1 = require("./entities/producto.entity");
const app_module_1 = require("../../app.module");
const firebase_module_1 = require("../firebase/firebase.module");
const useFirestore = process.env.USE_FIRESTORE === 'true';
let ProductosModule = class ProductosModule {
};
exports.ProductosModule = ProductosModule;
exports.ProductosModule = ProductosModule = __decorate([
    (0, common_1.Module)({
        imports: [
            ...(useFirestore ? [] : [typeorm_1.TypeOrmModule.forFeature([producto_entity_1.Producto])]),
            firebase_module_1.FirebaseModule,
            (0, common_1.forwardRef)(() => app_module_1.AppModule),
        ],
        controllers: [productos_controller_1.ProductosController],
        providers: [
            useFirestore ? productos_firestore_service_1.ProductosFirestoreService : productos_service_1.ProductosService,
            {
                provide: 'ProductosService',
                useClass: useFirestore ? productos_firestore_service_1.ProductosFirestoreService : productos_service_1.ProductosService,
            },
        ],
        exports: ['ProductosService'],
    })
], ProductosModule);
//# sourceMappingURL=productos.module.js.map