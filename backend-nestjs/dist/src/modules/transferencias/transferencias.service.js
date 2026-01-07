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
exports.TransferenciasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transferencia_entity_1 = require("./entities/transferencia.entity");
const producto_entity_1 = require("../productos/entities/producto.entity");
const inventario_service_1 = require("../inventario/inventario.service");
const contabilidad_service_1 = require("../contabilidad/contabilidad.service");
let TransferenciasService = class TransferenciasService {
    constructor(transferenciaRepository, productoRepository, inventarioService, contabilidadService) {
        this.transferenciaRepository = transferenciaRepository;
        this.productoRepository = productoRepository;
        this.inventarioService = inventarioService;
        this.contabilidadService = contabilidadService;
    }
    async create(createDto) {
        const transferencia = this.transferenciaRepository.create({
            ...createDto,
            fecha: createDto.fecha ? new Date(createDto.fecha) : new Date(),
            estado: createDto.estado || 'pendiente',
        });
        const transferenciaGuardada = await this.transferenciaRepository.save(transferencia);
        if (createDto.tipo === 'dinero' && createDto.monto > 0) {
            try {
                await this.contabilidadService.crearAsientoTransferencia({
                    origen: createDto.origen,
                    destino: createDto.destino,
                    monto: createDto.monto,
                    motivo: createDto.motivo || 'Transferencia de dinero',
                    fecha: transferenciaGuardada.fecha,
                });
            }
            catch (error) {
                console.error('Error al crear asiento contable para transferencia:', error);
            }
        }
        if (createDto.tipo === 'producto' && createDto.producto_id && createDto.cantidad) {
            if (createDto.origen_id && createDto.destino_id) {
                await this.inventarioService.transferirStock(createDto.producto_id, createDto.origen_id, createDto.destino_id, createDto.cantidad);
            }
            else {
                await this.inventarioService.registrarMovimiento({
                    producto_id: createDto.producto_id,
                    tipo: 'SALIDA',
                    cantidad: createDto.cantidad,
                    motivo: `Transferencia a ${createDto.destino}`,
                    observaciones: `Transferencia ID: ${transferenciaGuardada.id}`,
                    punto_venta_id: createDto.origen_id
                });
                await this.inventarioService.registrarMovimiento({
                    producto_id: createDto.producto_id,
                    tipo: 'ENTRADA',
                    cantidad: createDto.cantidad,
                    motivo: `Transferencia desde ${createDto.origen}`,
                    observaciones: `Transferencia ID: ${transferenciaGuardada.id}`,
                    punto_venta_id: createDto.destino_id
                });
            }
        }
        return transferenciaGuardada;
    }
    async findAll() {
        return this.transferenciaRepository.find({
            relations: ['producto'],
            order: { fecha: 'DESC', id: 'DESC' },
        });
    }
    async findOne(id) {
        return this.transferenciaRepository.findOne({
            where: { id },
            relations: ['producto'],
        });
    }
};
exports.TransferenciasService = TransferenciasService;
exports.TransferenciasService = TransferenciasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transferencia_entity_1.Transferencia)),
    __param(1, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => inventario_service_1.InventarioService))),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => contabilidad_service_1.ContabilidadService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        inventario_service_1.InventarioService,
        contabilidad_service_1.ContabilidadService])
], TransferenciasService);
//# sourceMappingURL=transferencias.service.js.map