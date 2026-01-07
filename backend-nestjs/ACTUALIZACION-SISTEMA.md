# Actualización del Sistema - Plan de Cuentas y Partida Doble

## ✅ Cambios Implementados

### 1. Base de Datos - Nuevas Entidades

#### PartidaContable (NUEVA)
- Tabla: `partidas_contables`
- Campos: id, asiento_id, cuenta_id, debe, haber, descripcion, created_at

#### CuentaContable (ACTUALIZADA)
- Nuevos campos:
  - `nivel`: Nivel jerárquico (int)
  - `padre_id`: ID de cuenta padre (nullable)
  - `activa`: Si la cuenta está activa (boolean)
  - `permite_movimiento`: Si permite movimientos directos (boolean)
  - `descripcion`: Descripción de la cuenta (text)
  - `updated_at`: Fecha de actualización (timestamp)

#### AsientoContable (ACTUALIZADA)
- Campos cambiados:
  - ❌ `debe` y `haber` (eliminados del asiento)
  - ✅ `total_debe` y `total_haber` (calculados automáticamente)
- Nueva relación: `partidas` (OneToMany con PartidaContable)

### 2. Nuevos Servicios

#### PlanCuentasService
- Gestión completa del Plan de Cuentas
- CRUD de cuentas contables
- Validación de jerarquía
- Inicialización de plan básico

#### ContabilidadService (ACTUALIZADO)
- `createAsiento()`: Crea asientos con validación de Partida Doble
- `crearAsientosFactura()`: Integrado con Plan de Cuentas
- `obtenerBalanceGeneral()`: Basado en partidas contables

### 3. Nuevos Endpoints API

#### Plan de Cuentas
- `GET /api/plan-cuentas` - Listar todas las cuentas (árbol)
- `GET /api/plan-cuentas/movimiento` - Cuentas que permiten movimientos
- `GET /api/plan-cuentas/:id` - Obtener por ID
- `GET /api/plan-cuentas/codigo/:codigo` - Obtener por código
- `POST /api/plan-cuentas` - Crear cuenta
- `PATCH /api/plan-cuentas/:id` - Actualizar cuenta
- `DELETE /api/plan-cuentas/:id` - Eliminar cuenta
- `GET /api/plan-cuentas/inicializar` - Inicializar plan básico

#### Asientos Contables
- `POST /api/contabilidad/asientos` - Crear asiento con partida doble
- `GET /api/contabilidad/asientos/:id` - Obtener asiento por ID

### 4. Migración de Datos

Si tienes datos existentes:

1. **Backup de la base de datos** (IMPORTANTE)
2. Las tablas se crearán automáticamente si `DATABASE_SYNC=true`
3. Ejecutar: `GET /api/plan-cuentas/inicializar` para crear el plan básico
4. Las facturas nuevas usarán automáticamente el nuevo sistema

## 📋 Pasos para Actualizar

### Opción 1: Sincronización Automática (Desarrollo)

1. Asegúrate de tener `DATABASE_SYNC=true` en `.env`
2. Reinicia el servidor backend
3. Ejecuta: `GET http://localhost:3001/api/plan-cuentas/inicializar`
4. ¡Listo!

### Opción 2: Migración Manual (Producción)

1. Crear script de migración SQL para:
   - Crear tabla `partidas_contables`
   - Agregar nuevos campos a `cuentas_contables`
   - Modificar tabla `asientos_contables`
   - Migrar datos existentes si es necesario

## ⚠️ Notas Importantes

1. **Partida Doble Obligatoria**: Todos los asientos deben cumplir: suma debe = suma haber
2. **Solo Cuentas de Último Nivel**: Solo las cuentas con `permite_movimiento=true` pueden tener partidas
3. **Plan de Cuentas**: Debe inicializarse antes de crear facturas
4. **Códigos Jerárquicos**: Deben seguir formato numérico (ej: 1.0.0, 1.1.01)

## 🔍 Verificación

Después de actualizar, verifica:

```bash
# 1. Verificar que el servidor compile
cd backend-nestjs
npm run build

# 2. Inicializar plan de cuentas
curl http://localhost:3001/api/plan-cuentas/inicializar

# 3. Verificar cuentas creadas
curl http://localhost:3001/api/plan-cuentas
```

## 📝 Archivos Modificados

- `backend-nestjs/src/modules/contabilidad/entities/cuenta-contable.entity.ts`
- `backend-nestjs/src/modules/contabilidad/entities/asiento-contable.entity.ts`
- `backend-nestjs/src/modules/contabilidad/entities/partida-contable.entity.ts` (NUEVO)
- `backend-nestjs/src/modules/contabilidad/services/plan-cuentas.service.ts` (NUEVO)
- `backend-nestjs/src/modules/contabilidad/controllers/plan-cuentas.controller.ts` (NUEVO)
- `backend-nestjs/src/modules/contabilidad/contabilidad.service.ts`
- `backend-nestjs/src/modules/contabilidad/contabilidad.controller.ts`
- `backend-nestjs/src/modules/contabilidad/contabilidad.module.ts`
- `backend-nestjs/src/config/database.module.ts`

## ✨ Características Nuevas

- ✅ Plan de Cuentas Jerárquico
- ✅ Partida Doble Obligatoria
- ✅ Validaciones Estrictas
- ✅ Balance General Automático
- ✅ Integración con Facturas
- ✅ API REST Completa


















