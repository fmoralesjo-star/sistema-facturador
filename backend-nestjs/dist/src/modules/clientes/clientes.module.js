"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const clientes_service_1 = require("./clientes.service");
const clientes_firestore_service_1 = require("./clientes-firestore.service");
const clientes_controller_1 = require("./clientes.controller");
const cliente_entity_1 = require("./entities/cliente.entity");
const app_module_1 = require("../../app.module");
const firebase_module_1 = require("../firebase/firebase.module");
const useFirestore = process.env.USE_FIRESTORE === 'true';
let ClientesModule = class ClientesModule {
};
exports.ClientesModule = ClientesModule;
exports.ClientesModule = ClientesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            ...(useFirestore ? [] : [typeorm_1.TypeOrmModule.forFeature([cliente_entity_1.Cliente])]),
            firebase_module_1.FirebaseModule,
            (0, common_1.forwardRef)(() => app_module_1.AppModule),
        ],
        controllers: [clientes_controller_1.ClientesController],
        providers: [
            useFirestore ? clientes_firestore_service_1.ClientesFirestoreService : clientes_service_1.ClientesService,
            {
                provide: 'ClientesService',
                useClass: useFirestore ? clientes_firestore_service_1.ClientesFirestoreService : clientes_service_1.ClientesService,
            },
        ],
        exports: ['ClientesService'],
    })
], ClientesModule);
//# sourceMappingURL=clientes.module.js.map