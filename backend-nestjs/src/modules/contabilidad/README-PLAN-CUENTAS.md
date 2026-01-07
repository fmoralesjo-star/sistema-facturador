# Plan de Cuentas y Partida Doble

## Descripción

Sistema contable robusto basado en **Partida Doble** con plan de cuentas jerárquico.

## Características

### 1. Plan de Cuentas Jerárquico

- Estructura padre-hijo con códigos numéricos (ejemplo: `1.0.0`, `1.1.0`, `1.1.01`)
- Niveles múltiples de jerarquía
- Solo cuentas de último nivel permiten movimientos directos
- Validación de códigos y estructura

### 2. Partida Doble

Cada asiento contable debe cumplir:
- **Suma de DEBE = Suma de HABER**
- Al menos dos partidas (una con debe, otra con haber)
- Cada partida está asociada a una cuenta contable

### 3. Estructura de Datos

#### CuentaContable
- `codigo`: Código jerárquico (ej: "1.1.01")
- `nombre`: Nombre de la cuenta
- `tipo`: ACTIVO, PASIVO, PATRIMONIO, INGRESO, EGRESO, COSTO
- `nivel`: Nivel jerárquico (1, 2, 3...)
- `padre_id`: ID de la cuenta padre (null para raíz)
- `permite_movimiento`: Solo true en cuentas de último nivel
- `activa`: Si la cuenta está activa

#### AsientoContable
- `numero_asiento`: Identificador único
- `fecha`: Fecha del asiento
- `descripcion`: Descripción del asiento
- `total_debe`: Suma total de debe (calculado)
- `total_haber`: Suma total de haber (calculado)
- `partidas`: Array de PartidaContable

#### PartidaContable
- `asiento_id`: ID del asiento
- `cuenta_id`: ID de la cuenta contable
- `debe`: Monto del debe
- `haber`: Monto del haber
- `descripcion`: Descripción de la partida

## Plan de Cuentas Básico

### 1.0.0 Activos
- **1.1.0 Activos Corrientes**
  - 1.1.01 Caja/Bancos
- **1.2.0 Activos No Corrientes**

### 2.0.0 Pasivos
- **2.1.0 Pasivos Corrientes**
  - 2.1.01 Cuentas por Pagar
  - 2.1.02 IVA por Pagar

### 3.0.0 Patrimonio

### 4.0.0 Ingresos
- **4.1.0 Ventas**
  - 4.1.01 Ventas IVA 15%
  - 4.1.02 Ventas sin IVA

### 5.0.0 Costos y Gastos

## API Endpoints

### Plan de Cuentas

- `GET /api/plan-cuentas` - Obtener todas las cuentas (árbol jerárquico)
- `GET /api/plan-cuentas/movimiento` - Obtener solo cuentas que permiten movimientos
- `GET /api/plan-cuentas/:id` - Obtener cuenta por ID
- `GET /api/plan-cuentas/codigo/:codigo` - Obtener cuenta por código
- `POST /api/plan-cuentas` - Crear nueva cuenta
- `PATCH /api/plan-cuentas/:id` - Actualizar cuenta
- `DELETE /api/plan-cuentas/:id` - Eliminar cuenta
- `GET /api/plan-cuentas/inicializar` - Inicializar plan básico

### Asientos Contables

- `POST /api/contabilidad/asientos` - Crear asiento con partida doble
- `GET /api/contabilidad/asientos` - Obtener todos los asientos
- `GET /api/contabilidad/asientos/:id` - Obtener asiento por ID
- `GET /api/contabilidad/balance` - Obtener balance general
- `GET /api/contabilidad/resumen` - Obtener resumen por fechas

## Ejemplo de Uso

### Crear Asiento con Partida Doble

```json
POST /api/contabilidad/asientos
{
  "fecha": "2024-01-15",
  "descripcion": "Venta de productos",
  "tipo": "VENTA",
  "partidas": [
    {
      "cuenta_id": 1,
      "debe": 118.00,
      "haber": 0,
      "descripcion": "Cuentas por Cobrar"
    },
    {
      "cuenta_id": 10,
      "debe": 0,
      "haber": 100.00,
      "descripcion": "Ventas"
    },
    {
      "cuenta_id": 5,
      "debe": 0,
      "haber": 18.00,
      "descripcion": "IVA por Pagar"
    }
  ]
}
```

**Validación**: 118.00 (debe) = 118.00 (haber) ✅

## Validaciones

1. **Partida Doble**: La suma de debe debe igualar la suma de haber
2. **Cuentas Activas**: Solo se pueden usar cuentas activas
3. **Permite Movimientos**: Solo cuentas de último nivel pueden tener movimientos
4. **Debe/Haber**: Una partida no puede tener debe y haber al mismo tiempo
5. **Valores Positivos**: Debe y haber deben ser positivos

## Integración con Facturas

Cuando se crea una factura, automáticamente se genera un asiento contable:

- **DEBE**: Cuentas por Cobrar (1.1.01) = Total factura
- **HABER**: Ventas IVA 15% (4.1.01) = Subtotal
- **HABER**: IVA por Pagar (2.1.02) = IVA

## Balance General

El balance general se calcula sumando los saldos de todas las cuentas:

- **Activos**: Suma de debe - suma de haber (cuentas ACTIVO)
- **Pasivos**: Suma de haber - suma de debe (cuentas PASIVO)
- **Patrimonio**: Activos - Pasivos
- **Ingresos**: Suma de haber - suma de debe (cuentas INGRESO)
- **Costos**: Suma de debe - suma de haber (cuentas COSTO)
- **Utilidad**: Ingresos - Costos - Egresos


















