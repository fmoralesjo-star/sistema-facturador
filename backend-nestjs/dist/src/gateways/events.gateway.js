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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let EventsGateway = class EventsGateway {
    constructor() {
        this.logger = new common_1.Logger('EventsGateway');
    }
    handleConnection(client) {
        this.logger.log(`Cliente conectado: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Cliente desconectado: ${client.id}`);
    }
    emitFacturaCreada(factura) {
        this.server.emit('factura-creada', factura);
    }
    emitFacturaActualizada(factura) {
        this.server.emit('factura-actualizada', factura);
    }
    emitClienteCreado(cliente) {
        this.server.emit('cliente-creado', cliente);
    }
    emitClienteActualizado(cliente) {
        this.server.emit('cliente-actualizado', cliente);
    }
    emitProductoCreado(producto) {
        this.server.emit('producto-creado', producto);
    }
    emitProductoActualizado(producto) {
        this.server.emit('producto-actualizado', producto);
    }
    emitProductoEliminado(id) {
        this.server.emit('producto-eliminado', { id });
    }
    emitContabilidadActualizada() {
        this.server.emit('contabilidad-actualizada');
    }
    emitInventarioActualizado() {
        this.server.emit('inventario-actualizado');
    }
    emitCompraCreada(compra) {
        this.server.emit('compra-creada', compra);
    }
    emitCompraActualizada(compra) {
        this.server.emit('compra-actualizada', compra);
    }
    emitStockBajo(data) {
        this.server.emit('stock-bajo', data);
    }
    emitUsuarioCreado(usuario) {
        this.server.emit('usuario-creado', usuario);
    }
    emitUsuarioActualizado(usuario) {
        this.server.emit('usuario-actualizado', usuario);
    }
    emitUsuarioEliminado(id) {
        this.server.emit('usuario-eliminado', { id });
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
exports.EventsGateway = EventsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://sistema-faacturador-a510e.web.app'],
            credentials: true,
        },
    })
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map