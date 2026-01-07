# Reportes Financieros

## Descripción

Sistema completo de reportes financieros basado en consultas SQL que suman saldos de las partidas contables.

## Reportes Implementados

### 1. Balance General

**Fórmula**: Activo = Pasivo + Patrimonio

**Estructura**:
- **ACTIVOS**: Suma de todas las cuentas de tipo ACTIVO
- **PASIVOS**: Suma de todas las cuentas de tipo PASIVO
- **PATRIMONIO**: Suma de todas las cuentas de tipo PATRIMONIO
- **Ecuación**: Valida que Activos = Pasivos + Patrimonio

**Endpoint**: 
```
GET /api/contabilidad/reportes/balance-general?fechaCorte=2024-01-31
```

**Ejemplo de respuesta**:
```json
{
  "activos": {
    "total": 1000.00,
    "cuentas": [
      { "codigo": "1.1.02", "nombre": "Cuentas por Cobrar", "saldo": 1000.00 }
    ]
  },
  "pasivos": {
    "total": 127.50,
    "cuentas": [
      { "codigo": "2.1.02", "nombre": "IVA Cobrado", "saldo": 127.50 }
    ]
  },
  "patrimonio": {
    "total": 0,
    "cuentas": []
  },
  "ecuacion": {
    "activo_total": 1000.00,
    "pasivo_patrimonio_total": 127.50,
    "balanceado": false,
    "diferencia": 872.50
  }
}
```

### 2. Estado de Pérdidas y Ganancias (P&L)

**Fórmula**: Utilidad = Ingresos - Costos - Gastos

**Estructura**:
- **INGRESOS**: Suma de todas las cuentas de tipo INGRESO
- **COSTOS**: Suma de todas las cuentas de tipo COSTO
- **GASTOS**: Suma de todas las cuentas de tipo EGRESO
- **Utilidad Bruta**: Ingresos - Costos
- **Utilidad Neta**: Ingresos - Costos - Gastos

**Endpoint**:
```
GET /api/contabilidad/reportes/perdidas-ganancias?fechaInicio=2024-01-01&fechaFin=2024-01-31
```

**Ejemplo de respuesta**:
```json
{
  "ingresos": {
    "total": 850.00,
    "cuentas": [
      { "codigo": "4.1.01", "nombre": "Ventas IVA 15%", "saldo": 850.00 }
    ]
  },
  "costos": {
    "total": 0,
    "cuentas": []
  },
  "gastos": {
    "total": 0,
    "cuentas": []
  },
  "utilidad_bruta": 850.00,
  "utilidad_neta": 850.00
}
```

### 3. Libro Mayor

**Descripción**: Movimientos detallados de una cuenta específica con saldo acumulado

**Características**:
- Saldo inicial (antes del período)
- Todos los movimientos (debe/haber) ordenados por fecha
- Saldo acumulado después de cada movimiento
- Saldo final

**Endpoint**:
```
GET /api/contabilidad/reportes/libro-mayor/1?fechaInicio=2024-01-01&fechaFin=2024-01-31
```

**Ejemplo de respuesta**:
```json
{
  "cuenta_id": 1,
  "codigo": "1.1.02",
  "nombre": "Cuentas por Cobrar / Clientes",
  "tipo": "ACTIVO",
  "saldo_inicial": 0,
  "movimientos": [
    {
      "fecha": "2024-01-15",
      "numero_asiento": "AS-EJEMPLO-001",
      "descripcion": "Factura FAC-001 - Clientes",
      "debe": 115.00,
      "haber": 0,
      "saldo_acumulado": 115.00
    }
  ],
  "saldo_final": 115.00
}
```

## Cálculo de Saldos

### Tipos de Cuenta

**ACTIVO, COSTO, EGRESO**:
- Saldo = Suma(Debe) - Suma(Haber)
- Aumenta con debe, disminuye con haber

**PASIVO, PATRIMONIO, INGRESO**:
- Saldo = Suma(Haber) - Suma(Debe)
- Aumenta con haber, disminuye con debe

## Consultas SQL Utilizadas

### Balance General
```sql
SELECT 
  cuenta.codigo,
  cuenta.nombre,
  SUM(partida.debe) as total_debe,
  SUM(partida.haber) as total_haber
FROM partidas_contables partida
INNER JOIN cuentas_contables cuenta ON partida.cuenta_id = cuenta.id
INNER JOIN asientos_contables asiento ON partida.asiento_id = asiento.id
WHERE cuenta.tipo = 'ACTIVO'
  AND cuenta.activa = true
  AND asiento.fecha <= :fechaCorte
GROUP BY cuenta.id, cuenta.codigo, cuenta.nombre
```

### Estado P&G
```sql
-- Similar al Balance General pero con rango de fechas
WHERE cuenta.tipo = 'INGRESO'
  AND asiento.fecha >= :fechaInicio
  AND asiento.fecha <= :fechaFin
```

### Libro Mayor
```sql
SELECT 
  asiento.fecha,
  asiento.numero_asiento,
  partida.descripcion,
  partida.debe,
  partida.haber
FROM partidas_contables partida
INNER JOIN asientos_contables asiento ON partida.asiento_id = asiento.id
WHERE partida.cuenta_id = :cuentaId
  AND asiento.fecha >= :fechaInicio
  AND asiento.fecha <= :fechaFin
ORDER BY asiento.fecha ASC, asiento.id ASC
```

## Interfaz de Usuario

### Página de Reportes
- **3 pestañas**: Balance General, Estado P&G, Libro Mayor
- **Filtros por fecha**: Para cada reporte
- **Tablas interactivas**: Con ordenamiento y formato
- **Validación de ecuación**: Muestra si está balanceado

### Características
- ✅ Diseño responsive
- ✅ Cálculos en tiempo real
- ✅ Validación de ecuaciones contables
- ✅ Formato de moneda
- ✅ Filtros de fecha

## Uso

1. **Acceder**: Menú "Reportes" o `/reportes`
2. **Balance General**: Seleccionar fecha de corte y ver balance
3. **Estado P&G**: Seleccionar rango de fechas y ver utilidades
4. **Libro Mayor**: Seleccionar cuenta y rango de fechas

## Validaciones

- **Balance General**: Valida que Activos = Pasivos + Patrimonio
- **Estado P&G**: Calcula utilidad bruta y neta automáticamente
- **Libro Mayor**: Calcula saldo acumulado correctamente según tipo de cuenta


















