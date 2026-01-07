"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const producto_entity_1 = require("../modules/productos/entities/producto.entity");
const cliente_entity_1 = require("../modules/clientes/entities/cliente.entity");
const factura_entity_1 = require("../modules/facturas/entities/factura.entity");
const factura_detalle_entity_1 = require("../modules/facturas/entities/factura-detalle.entity");
const movimiento_inventario_entity_1 = require("../modules/inventario/entities/movimiento-inventario.entity");
const asiento_contable_entity_1 = require("../modules/contabilidad/entities/asiento-contable.entity");
const cuenta_contable_entity_1 = require("../modules/contabilidad/entities/cuenta-contable.entity");
const partida_contable_entity_1 = require("../modules/contabilidad/entities/partida-contable.entity");
const empresa_entity_1 = require("../modules/empresa/entities/empresa.entity");
const establecimiento_entity_1 = require("../modules/empresa/entities/establecimiento.entity");
const voucher_entity_1 = require("../modules/facturas/entities/voucher.entity");
const empleado_entity_1 = require("../modules/recursos-humanos/entities/empleado.entity");
const asistencia_entity_1 = require("../modules/recursos-humanos/entities/asistencia.entity");
const rol_entity_1 = require("../modules/usuarios/entities/rol.entity");
const usuario_entity_1 = require("../modules/usuarios/entities/usuario.entity");
const usuario_permiso_entity_1 = require("../modules/usuarios/entities/usuario-permiso.entity");
const punto_venta_entity_1 = require("../modules/puntos-venta/entities/punto-venta.entity");
const producto_punto_venta_entity_1 = require("../modules/inventario/entities/producto-punto-venta.entity");
const transferencia_entity_1 = require("../modules/inventario/entities/transferencia.entity");
const transferencia_detalle_entity_1 = require("../modules/inventario/entities/transferencia-detalle.entity");
const ubicacion_entity_1 = require("../modules/inventario/entities/ubicacion.entity");
const producto_ubicacion_entity_1 = require("../modules/inventario/entities/producto-ubicacion.entity");
const caja_chica_movimiento_entity_1 = require("../modules/caja-chica/entities/caja-chica-movimiento.entity");
const audit_log_entity_1 = require("../modules/audit/entities/audit-log.entity");
const backup_log_entity_1 = require("../modules/admin/entities/backup-log.entity");
const documento_pendiente_sri_entity_1 = require("../modules/admin/entities/documento-pendiente-sri.entity");
const configuracion_entity_1 = require("../modules/admin/entities/configuracion.entity");
const plantilla_asiento_entity_1 = require("../modules/contabilidad/entities/plantilla-asiento.entity");
const plantilla_detalle_entity_1 = require("../modules/contabilidad/entities/plantilla-detalle.entity");
const sri_retencion_entity_1 = require("../modules/sri/entities/sri-retencion.entity");
const movimiento_bancario_extracto_entity_1 = require("../modules/conciliaciones/entities/movimiento-bancario-extracto.entity");
const banco_entity_1 = require("../modules/bancos/entities/banco.entity");
const conciliacion_bancaria_entity_1 = require("../modules/conciliaciones/entities/conciliacion-bancaria.entity");
const comprobante_retencion_entity_1 = require("../modules/compras/entities/comprobante-retencion.entity");
const proveedor_entity_1 = require("../modules/compras/entities/proveedor.entity");
const queue_job_entity_1 = require("../modules/common/entities/queue-job.entity");
const stored_file_entity_1 = require("../modules/common/entities/stored-file.entity");
const useFirestore = process.env.USE_FIRESTORE === 'true' || process.env.USE_FIRESTORE === 'True';
if (useFirestore) {
    console.log('🔥 DatabaseModule: Firestore activado - TypeORM deshabilitado');
}
else {
    console.log('🗄️ DatabaseModule: PostgreSQL activado - TypeORM habilitado');
}
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            ...(!useFirestore ? [
                typeorm_1.TypeOrmModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    useFactory: (configService) => {
                        const isProduction = configService.get('NODE_ENV') === 'production';
                        const databaseUrl = configService.get('DATABASE_URL');
                        if (databaseUrl) {
                            console.log('🌐 Using DATABASE_URL for connection (production mode)');
                            return {
                                type: 'postgres',
                                url: databaseUrl,
                                entities: [
                                    producto_entity_1.Producto,
                                    cliente_entity_1.Cliente,
                                    factura_entity_1.Factura,
                                    factura_detalle_entity_1.FacturaDetalle,
                                    movimiento_inventario_entity_1.MovimientoInventario,
                                    asiento_contable_entity_1.AsientoContable,
                                    cuenta_contable_entity_1.CuentaContable,
                                    partida_contable_entity_1.PartidaContable,
                                    empresa_entity_1.Empresa,
                                    establecimiento_entity_1.Establecimiento,
                                    voucher_entity_1.Voucher,
                                    empleado_entity_1.Empleado,
                                    asistencia_entity_1.Asistencia,
                                    rol_entity_1.Rol,
                                    usuario_entity_1.Usuario,
                                    usuario_permiso_entity_1.UsuarioPermiso,
                                    punto_venta_entity_1.PuntoVenta,
                                    producto_punto_venta_entity_1.ProductoPuntoVenta,
                                    transferencia_entity_1.Transferencia,
                                    transferencia_detalle_entity_1.TransferenciaDetalle,
                                    ubicacion_entity_1.Ubicacion,
                                    producto_ubicacion_entity_1.ProductoUbicacion,
                                    caja_chica_movimiento_entity_1.CajaChicaMovimiento,
                                    audit_log_entity_1.AuditLog,
                                    backup_log_entity_1.BackupLog,
                                    documento_pendiente_sri_entity_1.DocumentoPendienteSRI,
                                    configuracion_entity_1.Configuracion,
                                    sri_retencion_entity_1.SriRetencion,
                                    movimiento_bancario_extracto_entity_1.MovimientoBancarioExtracto,
                                    banco_entity_1.Banco,
                                    conciliacion_bancaria_entity_1.ConciliacionBancaria,
                                    plantilla_asiento_entity_1.PlantillaAsiento,
                                    plantilla_detalle_entity_1.PlantillaDetalle,
                                    comprobante_retencion_entity_1.ComprobanteRetencion,
                                    proveedor_entity_1.Proveedor,
                                    queue_job_entity_1.QueueJob,
                                    stored_file_entity_1.StoredFile,
                                ],
                                synchronize: false,
                                logging: isProduction ? ['error', 'warn'] : true,
                                ssl: isProduction ? { rejectUnauthorized: false } : false,
                                extra: {
                                    max: 10,
                                    connectionTimeoutMillis: 10000,
                                },
                            };
                        }
                        console.log('🔍 DEBUG DB CONNECTION:', {
                            user: configService.get('DATABASE_USER'),
                            db: configService.get('DATABASE_NAME'),
                            host: configService.get('DATABASE_HOST', 'localhost'),
                            port: 5432
                        });
                        return {
                            type: 'postgres',
                            host: configService.get('DATABASE_HOST', 'localhost'),
                            connectTimeoutMS: 10000,
                            port: configService.get('DATABASE_PORT', 5432),
                            username: configService.get('DATABASE_USER', 'facturador'),
                            password: configService.get('DATABASE_PASSWORD', 'password'),
                            database: configService.get('DATABASE_NAME', 'facturador_db'),
                            entities: [
                                producto_entity_1.Producto,
                                cliente_entity_1.Cliente,
                                factura_entity_1.Factura,
                                factura_detalle_entity_1.FacturaDetalle,
                                movimiento_inventario_entity_1.MovimientoInventario,
                                asiento_contable_entity_1.AsientoContable,
                                cuenta_contable_entity_1.CuentaContable,
                                partida_contable_entity_1.PartidaContable,
                                empresa_entity_1.Empresa,
                                establecimiento_entity_1.Establecimiento,
                                voucher_entity_1.Voucher,
                                empleado_entity_1.Empleado,
                                asistencia_entity_1.Asistencia,
                                rol_entity_1.Rol,
                                usuario_entity_1.Usuario,
                                usuario_permiso_entity_1.UsuarioPermiso,
                                punto_venta_entity_1.PuntoVenta,
                                producto_punto_venta_entity_1.ProductoPuntoVenta,
                                transferencia_entity_1.Transferencia,
                                transferencia_detalle_entity_1.TransferenciaDetalle,
                                ubicacion_entity_1.Ubicacion,
                                producto_ubicacion_entity_1.ProductoUbicacion,
                                caja_chica_movimiento_entity_1.CajaChicaMovimiento,
                                audit_log_entity_1.AuditLog,
                                backup_log_entity_1.BackupLog,
                                documento_pendiente_sri_entity_1.DocumentoPendienteSRI,
                                configuracion_entity_1.Configuracion,
                                sri_retencion_entity_1.SriRetencion,
                                movimiento_bancario_extracto_entity_1.MovimientoBancarioExtracto,
                                banco_entity_1.Banco,
                                conciliacion_bancaria_entity_1.ConciliacionBancaria,
                                plantilla_asiento_entity_1.PlantillaAsiento,
                                plantilla_detalle_entity_1.PlantillaDetalle,
                                comprobante_retencion_entity_1.ComprobanteRetencion,
                                proveedor_entity_1.Proveedor,
                                queue_job_entity_1.QueueJob,
                                stored_file_entity_1.StoredFile,
                            ],
                            synchronize: false,
                            logging: true,
                            ssl: false,
                        };
                    },
                    inject: [config_1.ConfigService],
                }),
            ] : []),
        ],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map