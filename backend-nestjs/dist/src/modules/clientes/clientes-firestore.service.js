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
exports.ClientesFirestoreService = void 0;
const common_1 = require("@nestjs/common");
const firestore_service_1 = require("../firebase/firestore.service");
const events_gateway_1 = require("../../gateways/events.gateway");
let ClientesFirestoreService = class ClientesFirestoreService {
    constructor(firestoreService, eventsGateway) {
        this.firestoreService = firestoreService;
        this.eventsGateway = eventsGateway;
        this.collectionName = 'clientes';
    }
    async findAll() {
        if (!this.firestoreService.isAvailable()) {
            return [];
        }
        return this.firestoreService.findAll(this.collectionName, undefined, { field: 'nombre', direction: 'asc' });
    }
    async findOne(id) {
        if (!this.firestoreService.isAvailable()) {
            throw new common_1.NotFoundException(`Cliente con ID ${id} no encontrado`);
        }
        const cliente = await this.firestoreService.findOne(this.collectionName, id);
        if (!cliente) {
            throw new common_1.NotFoundException(`Cliente con ID ${id} no encontrado`);
        }
        return cliente;
    }
    async findByRuc(ruc) {
        if (!this.firestoreService.isAvailable()) {
            return null;
        }
        const clientes = await this.firestoreService.findByField(this.collectionName, 'ruc', ruc);
        return clientes.length > 0 ? clientes[0] : null;
    }
    async create(createDto) {
        if (!this.firestoreService.isAvailable()) {
            throw new Error('Firestore no está disponible');
        }
        if (createDto.ruc) {
            const existe = await this.findByRuc(createDto.ruc);
            if (existe) {
                throw new Error(`Ya existe un cliente con RUC "${createDto.ruc}"`);
            }
        }
        const id = await this.firestoreService.create(this.collectionName, createDto);
        const cliente = { id, ...createDto };
        this.eventsGateway.emitClienteCreado(cliente);
        return cliente;
    }
    async update(id, updateDto) {
        if (!this.firestoreService.isAvailable()) {
            throw new Error('Firestore no está disponible');
        }
        await this.findOne(id);
        await this.firestoreService.update(this.collectionName, id, updateDto);
        const cliente = await this.findOne(id);
        this.eventsGateway.emitClienteActualizado(cliente);
        return cliente;
    }
    async remove(id) {
        if (!this.firestoreService.isAvailable()) {
            throw new Error('Firestore no está disponible');
        }
        await this.findOne(id);
        await this.firestoreService.delete(this.collectionName, id);
        return { success: true };
    }
};
exports.ClientesFirestoreService = ClientesFirestoreService;
exports.ClientesFirestoreService = ClientesFirestoreService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => events_gateway_1.EventsGateway))),
    __metadata("design:paramtypes", [firestore_service_1.FirestoreService,
        events_gateway_1.EventsGateway])
], ClientesFirestoreService);
//# sourceMappingURL=clientes-firestore.service.js.map