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
exports.Factura = void 0;
const typeorm_1 = require("typeorm");
const cliente_entity_1 = require("../../clientes/entities/cliente.entity");
const factura_detalle_entity_1 = require("./factura-detalle.entity");
const asiento_contable_entity_1 = require("../../contabilidad/entities/asiento-contable.entity");
const empresa_entity_1 = require("../../empresa/entities/empresa.entity");
const empleado_entity_1 = require("../../recursos-humanos/entities/empleado.entity");
const voucher_entity_1 = require("./voucher.entity");
let Factura = class Factura {
};
exports.Factura = Factura;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Factura.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 50 }),
    __metadata("design:type", String)
], Factura.prototype, "numero", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cliente_entity_1.Cliente, (cliente) => cliente.facturas),
    (0, typeorm_1.JoinColumn)({ name: 'cliente_id' }),
    __metadata("design:type", cliente_entity_1.Cliente)
], Factura.prototype, "cliente", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Factura.prototype, "cliente_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => empresa_entity_1.Empresa, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'empresa_id' }),
    __metadata("design:type", empresa_entity_1.Empresa)
], Factura.prototype, "empresa", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Factura.prototype, "empresa_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => empleado_entity_1.Empleado, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'vendedor_id' }),
    __metadata("design:type", empleado_entity_1.Empleado)
], Factura.prototype, "vendedor", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Factura.prototype, "vendedor_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Factura.prototype, "punto_venta_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Factura.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Factura.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Factura.prototype, "impuesto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Factura.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'PENDIENTE' }),
    __metadata("design:type", String)
], Factura.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3, default: '001' }),
    __metadata("design:type", String)
], Factura.prototype, "establecimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3, default: '001' }),
    __metadata("design:type", String)
], Factura.prototype, "punto_emision", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 9, nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "secuencial", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2, default: '01' }),
    __metadata("design:type", String)
], Factura.prototype, "tipo_comprobante", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 1, default: '2' }),
    __metadata("design:type", String)
], Factura.prototype, "ambiente", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 49, nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "clave_acceso", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "autorizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Factura.prototype, "fecha_autorizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "xml_autorizado", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, default: 'SIN UTILIZACION DEL SISTEMA FINANCIERO' }),
    __metadata("design:type", String)
], Factura.prototype, "forma_pago", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'CONTADO' }),
    __metadata("design:type", String)
], Factura.prototype, "condicion_pago", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "retencion_numero", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Factura.prototype, "retencion_valor_ir", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Factura.prototype, "retencion_valor_iva", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Factura.prototype, "retencion_fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "emisor_ruc", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "emisor_razon_social", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "emisor_nombre_comercial", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "emisor_direccion_matriz", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "emisor_direccion_establecimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "emisor_telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "emisor_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "cliente_direccion", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "cliente_telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "cliente_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "estado_sri", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "mensaje_sri", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => factura_detalle_entity_1.FacturaDetalle, (detalle) => detalle.factura, { cascade: true }),
    __metadata("design:type", Array)
], Factura.prototype, "detalles", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => asiento_contable_entity_1.AsientoContable, (asiento) => asiento.factura),
    __metadata("design:type", Array)
], Factura.prototype, "asientos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => voucher_entity_1.Voucher, (voucher) => voucher.factura),
    __metadata("design:type", Array)
], Factura.prototype, "vouchers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Factura.prototype, "asiento_contable_creado", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "numero_asiento_contable", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Factura.prototype, "observaciones_contables", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
    __metadata("design:type", Array)
], Factura.prototype, "info_adicional", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Factura.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Factura.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', select: false }),
    __metadata("design:type", Date)
], Factura.prototype, "deleted_at", void 0);
exports.Factura = Factura = __decorate([
    (0, typeorm_1.Entity)('facturas')
], Factura);
//# sourceMappingURL=factura.entity.js.map