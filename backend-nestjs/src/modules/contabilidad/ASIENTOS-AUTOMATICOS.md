# Asientos Contables Automáticos

## Descripción

Cada factura emitida **genera automáticamente** un asiento contable con partida doble.

## Estructura del Asiento

Para una factura de **$100 + IVA 15% ($15) = Total $115**, se genera:

### Partidas del Asiento:

1. **DEBE**: 
   - Cuenta: `1.1.02 - Cuentas por Cobrar / Clientes`
   - Monto: **$115.00** (Total de la factura)
   - Descripción: "Factura XXX - Clientes / Cuentas por Cobrar"

2. **HABER**:
   - Cuenta: `4.1.01 - Ventas IVA 15%`
   - Monto: **$100.00** (Subtotal sin IVA)
   - Descripción: "Factura XXX - Ventas"

3. **HABER**:
   - Cuenta: `2.1.02 - IVA Cobrado / IVA por Pagar`
   - Monto: **$15.00** (IVA)
   - Descripción: "Factura XXX - IVA Cobrado"

### Validación de Partida Doble:

✅ **DEBE**: $115.00
✅ **HABER**: $100.00 + $15.00 = $115.00
✅ **BALANCEADO**: $115.00 = $115.00 ✓

## Cuentas Utilizadas

### 1.1.02 - Cuentas por Cobrar / Clientes (ACTIVO)
- Tipo: ACTIVO CORRIENTE
- Uso: Representa el derecho de cobro sobre los clientes
- Debe cuando: Se emite una factura (cliente nos debe)

### 4.1.01 - Ventas IVA 15% (INGRESO)
- Tipo: INGRESO
- Uso: Registra las ventas realizadas
- Haber cuando: Se realiza una venta (ingreso por ventas)

### 2.1.02 - IVA Cobrado / IVA por Pagar (PASIVO)
- Tipo: PASIVO CORRIENTE
- Uso: Representa la obligación de pagar IVA al estado
- Haber cuando: Se cobra IVA en una venta (obligación con el estado)

## Flujo Automático

1. Se crea una factura en el sistema
2. Se valida stock y se registra en inventario
3. **AUTOMÁTICAMENTE** se ejecuta `crearAsientosFactura()`
4. Se buscan las cuentas del plan de cuentas
5. Se crea el asiento con las 3 partidas
6. Se valida la partida doble (debe = haber)
7. Se guarda todo en la misma transacción

## Código de Ejemplo

```typescript
// En facturas.service.ts - línea 111
await this.contabilidadService.crearAsientosFactura(
  facturaGuardada,
  queryRunner,
);
```

El asiento se crea dentro de la misma transacción de la factura, garantizando consistencia.

## Notas Importantes

- ✅ El asiento se crea **automáticamente** - no requiere acción manual
- ✅ Usa **Partida Doble** - siempre balanceado
- ✅ Está en la **misma transacción** - si falla la factura, se revierte el asiento
- ✅ Usa cuentas del **Plan de Cuentas** configurado
- ⚠️ Si las cuentas no existen, la factura fallará con error descriptivo

## Inicialización

Antes de crear facturas, asegúrate de inicializar el plan de cuentas:

```bash
GET /api/plan-cuentas/inicializar
```

Esto creará todas las cuentas necesarias, incluyendo:
- 1.1.02 Cuentas por Cobrar / Clientes
- 4.1.01 Ventas IVA 15%
- 2.1.02 IVA Cobrado / IVA por Pagar


















