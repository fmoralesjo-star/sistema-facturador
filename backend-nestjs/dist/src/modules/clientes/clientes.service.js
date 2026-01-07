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
exports.ClientesService = exports.UpdateClienteDto = exports.CreateClienteDto = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_validator_1 = require("class-validator");
const cliente_entity_1 = require("./entities/cliente.entity");
const events_gateway_1 = require("../../gateways/events.gateway");
class CreateClienteDto {
}
exports.CreateClienteDto = CreateClienteDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClienteDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClienteDto.prototype, "ruc", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClienteDto.prototype, "direccion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClienteDto.prototype, "telefono", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateClienteDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClienteDto.prototype, "fechaNacimiento", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateClienteDto.prototype, "esExtranjero", void 0);
class UpdateClienteDto {
}
exports.UpdateClienteDto = UpdateClienteDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateClienteDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateClienteDto.prototype, "ruc", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateClienteDto.prototype, "direccion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateClienteDto.prototype, "telefono", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateClienteDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateClienteDto.prototype, "fechaNacimiento", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateClienteDto.prototype, "esExtranjero", void 0);
let ClientesService = class ClientesService {
    constructor(clienteRepository, eventsGateway) {
        this.clienteRepository = clienteRepository;
        this.eventsGateway = eventsGateway;
    }
    async findAll() {
        return this.clienteRepository.find({
            order: { nombre: 'ASC' },
        });
    }
    async findOne(id) {
        const cliente = await this.clienteRepository.findOne({ where: { id } });
        if (!cliente) {
            throw new common_1.NotFoundException(`Cliente con ID ${id} no encontrado`);
        }
        return cliente;
    }
    async findByRuc(ruc) {
        return this.clienteRepository.findOne({ where: { ruc } });
    }
    async create(createDto) {
        const cliente = this.clienteRepository.create(createDto);
        const saved = await this.clienteRepository.save(cliente);
        this.eventsGateway.emitClienteCreado(saved);
        return saved;
    }
    async update(id, updateDto) {
        const cliente = await this.findOne(id);
        Object.assign(cliente, updateDto);
        const saved = await this.clienteRepository.save(cliente);
        this.eventsGateway.emitClienteActualizado(saved);
        return saved;
    }
    async remove(id) {
        const cliente = await this.findOne(id);
        await this.clienteRepository.remove(cliente);
        return { success: true };
    }
    async getHistorialCompras(clienteId, limit = 50) {
        const cliente = await this.findOne(clienteId);
        const facturas = await this.clienteRepository.manager.query(`
      SELECT 
        f.id,
        f.numero,
        f.fecha,
        f.subtotal,
        f.impuesto,
        f.total,
        f.estado,
        f.forma_pago,
        f.clave_acceso,
        f.autorizacion
      FROM facturas f
      WHERE f.cliente_id = $1
      ORDER BY f.fecha DESC, f.id DESC
      LIMIT $2
    `, [clienteId, limit]);
        return {
            cliente: {
                id: cliente.id,
                nombre: cliente.nombre,
                ruc: cliente.ruc,
                email: cliente.email
            },
            facturas,
            total_facturas: facturas.length
        };
    }
    async getProductosFrecuentes(clienteId, limit = 10) {
        await this.findOne(clienteId);
        const productos = await this.clienteRepository.manager.query(`
      SELECT 
        p.id,
        p.nombre,
        p.codigo,
        p.precio_venta,
        COUNT(fd.id) as veces_comprado,
        SUM(fd.cantidad) as cantidad_total,
        SUM(fd.subtotal) as total_gastado,
        MAX(f.fecha) as ultima_compra
      FROM factura_detalles fd
      INNER JOIN facturas f ON f.id = fd.factura_id
      INNER JOIN productos p ON p.id = fd.producto_id
      WHERE f.cliente_id = $1 AND f.estado != 'ANULADA'
      GROUP BY p.id, p.nombre, p.codigo, p.precio_venta
      ORDER BY cantidad_total DESC, veces_comprado DESC
      LIMIT $2
    `, [clienteId, limit]);
        return productos;
    }
    async getEstadisticas(clienteId) {
        const cliente = await this.findOne(clienteId);
        const stats = await this.clienteRepository.manager.query(`
      SELECT 
        COUNT(f.id) as total_facturas,
        COALESCE(SUM(f.total), 0) as total_gastado,
        COALESCE(AVG(f.total), 0) as promedio_compra,
        COALESCE(MIN(f.total), 0) as compra_minima,
        COALESCE(MAX(f.total), 0) as compra_maxima,
        MIN(f.fecha) as primera_compra,
        MAX(f.fecha) as ultima_compra
      FROM facturas f
      WHERE f.cliente_id = $1 AND f.estado != 'ANULADA'
    `, [clienteId]);
        const comprasPorMes = await this.clienteRepository.manager.query(`
      SELECT 
        TO_CHAR(f.fecha, 'YYYY-MM') as mes,
        COUNT(f.id) as cantidad_facturas,
        COALESCE(SUM(f.total), 0) as total
      FROM facturas f
      WHERE f.cliente_id = $1 
        AND f.estado != 'ANULADA'
        AND f.fecha >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY TO_CHAR(f.fecha, 'YYYY-MM')
      ORDER BY mes DESC
    `, [clienteId]);
        const productosUnicos = await this.clienteRepository.manager.query(`
      SELECT COUNT(DISTINCT fd.producto_id) as total
      FROM factura_detalles fd
      INNER JOIN facturas f ON f.id = fd.factura_id
      WHERE f.cliente_id = $1 AND f.estado != 'ANULADA'
    `, [clienteId]);
        return {
            cliente: {
                id: cliente.id,
                nombre: cliente.nombre,
                ruc: cliente.ruc,
                tipo_cliente: cliente.tipo_cliente,
                limite_credito: cliente.limite_credito
            },
            resumen: stats[0] || {},
            productos_unicos_comprados: parseInt(productosUnicos[0]?.total || '0'),
            compras_por_mes: comprasPorMes
        };
    }
    async actualizarTotalesCliente(clienteId) {
        const stats = await this.clienteRepository.manager.query(`
      SELECT 
        COUNT(f.id) as cantidad,
        COALESCE(SUM(f.total), 0) as total,
        MAX(f.fecha) as ultima
      FROM facturas f
      WHERE f.cliente_id = $1 AND f.estado != 'ANULADA'
    `, [clienteId]);
        if (stats[0]) {
            await this.clienteRepository.update(clienteId, {
                cantidad_compras: parseInt(stats[0].cantidad) || 0,
                total_compras_historico: parseFloat(stats[0].total) || 0,
                ultima_compra: stats[0].ultima || null
            });
        }
        return stats[0];
    }
};
exports.ClientesService = ClientesService;
exports.ClientesService = ClientesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cliente_entity_1.Cliente)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => events_gateway_1.EventsGateway))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        events_gateway_1.EventsGateway])
], ClientesService);
//# sourceMappingURL=clientes.service.js.map