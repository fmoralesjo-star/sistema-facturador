import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Producto } from '../modules/productos/entities/producto.entity';
import { Cliente } from '../modules/clientes/entities/cliente.entity';
import { Factura } from '../modules/facturas/entities/factura.entity';
import { FacturaDetalle } from '../modules/facturas/entities/factura-detalle.entity';
import { MovimientoInventario } from '../modules/inventario/entities/movimiento-inventario.entity';
import { AsientoContable } from '../modules/contabilidad/entities/asiento-contable.entity';
import { CuentaContable } from '../modules/contabilidad/entities/cuenta-contable.entity';
import { PartidaContable } from '../modules/contabilidad/entities/partida-contable.entity';
import { Empresa } from '../modules/empresa/entities/empresa.entity';
import { Establecimiento } from '../modules/empresa/entities/establecimiento.entity';
import { Voucher } from '../modules/facturas/entities/voucher.entity';
import { Empleado } from '../modules/recursos-humanos/entities/empleado.entity';

import { Asistencia } from '../modules/recursos-humanos/entities/asistencia.entity';
import { Rol } from '../modules/usuarios/entities/rol.entity';
import { Usuario } from '../modules/usuarios/entities/usuario.entity';
import { UsuarioPermiso } from '../modules/usuarios/entities/usuario-permiso.entity';
import { PuntoVenta } from '../modules/puntos-venta/entities/punto-venta.entity';
import { ProductoPuntoVenta } from '../modules/inventario/entities/producto-punto-venta.entity';
import { Transferencia } from '../modules/inventario/entities/transferencia.entity';
import { TransferenciaDetalle } from '../modules/inventario/entities/transferencia-detalle.entity';
import { Ubicacion } from '../modules/inventario/entities/ubicacion.entity';
import { ProductoUbicacion } from '../modules/inventario/entities/producto-ubicacion.entity';
import { CajaChicaMovimiento } from '../modules/caja-chica/entities/caja-chica-movimiento.entity';
import { AuditLog } from '../modules/audit/entities/audit-log.entity';
import { BackupLog } from '../modules/admin/entities/backup-log.entity';
import { DocumentoPendienteSRI } from '../modules/admin/entities/documento-pendiente-sri.entity';
import { Configuracion } from '../modules/admin/entities/configuracion.entity';
import { PlantillaAsiento } from '../modules/contabilidad/entities/plantilla-asiento.entity';
import { PlantillaDetalle } from '../modules/contabilidad/entities/plantilla-detalle.entity';
import { SriRetencion } from '../modules/sri/entities/sri-retencion.entity';
import { MovimientoBancarioExtracto } from '../modules/conciliaciones/entities/movimiento-bancario-extracto.entity';
import { Banco } from '../modules/bancos/entities/banco.entity';
import { ConciliacionBancaria } from '../modules/conciliaciones/entities/conciliacion-bancaria.entity';
import { ComprobanteRetencion } from '../modules/compras/entities/comprobante-retencion.entity';
import { Proveedor } from '../modules/compras/entities/proveedor.entity';
import { QueueJob } from '../modules/common/entities/queue-job.entity';
import { StoredFile } from '../modules/common/entities/stored-file.entity';

const useFirestore = process.env.USE_FIRESTORE === 'true' || process.env.USE_FIRESTORE === 'True';

// Log para debugging
if (useFirestore) {
  console.log('🔥 DatabaseModule: Firestore activado - TypeORM deshabilitado');
} else {
  console.log('🗄️ DatabaseModule: PostgreSQL activado - TypeORM habilitado');
}

@Module({
  imports: [
    // Solo inicializar TypeORM si NO se usa Firestore
    // TypeORM se necesita para módulos como Facturas, SRI, etc.
    ...(!useFirestore ? [
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const isProduction = configService.get('NODE_ENV') === 'production';
          const databaseUrl = configService.get('DATABASE_URL');

          // Opción 1: Usar DATABASE_URL (Render y otros servicios cloud)
          if (databaseUrl) {
            console.log('🌐 Using DATABASE_URL for connection (production mode)');
            return {
              type: 'postgres',
              url: databaseUrl,
              entities: [
                Producto,
                Cliente,
                Factura,
                FacturaDetalle,
                MovimientoInventario,
                AsientoContable,
                CuentaContable,
                PartidaContable,
                Empresa,
                Establecimiento,
                Voucher,
                Empleado,
                Asistencia,
                Rol,
                Usuario,
                UsuarioPermiso,
                PuntoVenta,
                ProductoPuntoVenta,
                Transferencia,
                TransferenciaDetalle,
                Ubicacion,
                ProductoUbicacion,
                CajaChicaMovimiento,
                AuditLog,
                BackupLog,
                DocumentoPendienteSRI,
                Configuracion,
                SriRetencion,
                MovimientoBancarioExtracto,
                Banco,
                ConciliacionBancaria,
                PlantillaAsiento,
                PlantillaDetalle,
                ComprobanteRetencion,
                Proveedor,
                QueueJob,
                StoredFile,
              ],
              synchronize: false, // DESACTIVADO para diagnosticar si la conexión funciona
              logging: true,
              ssl: { rejectUnauthorized: false }, // Requerido por Render
              extra: {
                max: 20, // Aumentar pool size
                connectionTimeoutMillis: 10000,
                keepAlive: true,
              },
            };
          }

          // Opción 2: Usar variables individuales (desarrollo local)
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
              Producto,
              Cliente,
              Factura,
              FacturaDetalle,
              MovimientoInventario,
              AsientoContable,
              CuentaContable,
              PartidaContable,
              Empresa,
              Establecimiento,
              Voucher,
              Empleado,
              Asistencia,
              Rol,
              Usuario,
              UsuarioPermiso,
              PuntoVenta,
              ProductoPuntoVenta,
              Transferencia,
              TransferenciaDetalle,
              Ubicacion,
              ProductoUbicacion,
              CajaChicaMovimiento,
              AuditLog,
              BackupLog,
              DocumentoPendienteSRI,
              Configuracion,
              SriRetencion,
              MovimientoBancarioExtracto,
              Banco,
              ConciliacionBancaria,
              PlantillaAsiento,
              PlantillaDetalle,
              ComprobanteRetencion,
              Proveedor,
              QueueJob,
              StoredFile,
            ],
            synchronize: true, // FORZADO TEMPORALMENTE para debug
            logging: true,
            ssl: false,
          };
        },
        inject: [ConfigService],
      }),
    ] : []),
  ],
})
export class DatabaseModule { }

