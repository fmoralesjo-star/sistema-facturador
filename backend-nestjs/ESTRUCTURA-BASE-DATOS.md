# Estructura de Base de Datos - Tablas Clave

## Resumen de Implementación

Este documento describe las tablas clave del sistema según la especificación solicitada.

## 1. users_companies (Empresa)

**Propósito**: Datos del emisor (RUC, Razón Social, Dirección, Obligado a llevar contabilidad)

**Entidad**: `backend-nestjs/src/modules/empresa/entities/empresa.entity.ts`

**Campos**:
- `id`: Identificador único
- `ruc`: RUC del emisor (13 dígitos, único)
- `razon_social`: Razón social de la empresa
- `nombre_comercial`: Nombre comercial (opcional)
- `direccion_matriz`: Dirección matriz
- `direccion_establecimiento`: Dirección del establecimiento
- `telefono`: Teléfono
- `email`: Email
- `contribuyente_especial`: Número de resolución si es contribuyente especial
- `obligado_contabilidad`: Boolean - Obligado a llevar contabilidad
- `codigo_establecimiento`: Código del establecimiento (001, 002, etc.)
- `punto_emision`: Punto de emisión
- `observaciones`: Observaciones adicionales
- `activa`: Si la empresa está activa
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

## 2. products (Producto)

**Propósito**: Código, stock, precio, y tipo de impuesto (IVA 0, 15, Exento)

**Entidad**: `backend-nestjs/src/modules/productos/entities/producto.entity.ts`

**Campos**:
- `id`: Identificador único
- `codigo`: Código del producto (único)
- `nombre`: Nombre del producto
- `descripcion`: Descripción del producto
- `precio`: Precio del producto
- `stock`: Cantidad en stock
- `tipo_impuesto`: Tipo de impuesto ('0' = IVA 0%, '15' = IVA 15%, 'EXENTO' = Exento de IVA)
- `activo`: Si el producto está activo
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

## 3. vouchers (Voucher/Comprobante)

**Propósito**: Almacena el XML, la Clave de Acceso, el estado del SRI y el PDF (RIDE)

**Entidad**: `backend-nestjs/src/modules/facturas/entities/voucher.entity.ts`

**Campos**:
- `id`: Identificador único
- `factura_id`: ID de la factura relacionada
- `clave_acceso`: Clave de acceso de 49 dígitos (único)
- `xml_generado`: XML generado antes de firmar
- `xml_firmado`: XML firmado digitalmente
- `xml_autorizado`: XML autorizado por el SRI (respuesta final)
- `estado_sri`: Estado del SRI (PENDIENTE, RECIBIDA, AUTORIZADO, NO AUTORIZADO, EN PROCESO)
- `mensaje_sri`: Mensajes del SRI
- `numero_autorizacion`: Número de autorización del SRI
- `fecha_autorizacion`: Fecha de autorización
- `ambiente`: Ambiente ('1' = Producción, '2' = Pruebas)
- `pdf_ride`: Archivo PDF del RIDE en binario (bytea)
- `ruta_pdf`: Ruta del archivo PDF en el servidor
- `observaciones`: Observaciones adicionales
- `metadata`: Datos adicionales en formato JSON
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

## 4. accounting_journal (AsientoContable)

**Propósito**: Cabecera del asiento (Fecha, glosa, número de asiento)

**Entidad**: `backend-nestjs/src/modules/contabilidad/entities/asiento-contable.entity.ts`

**Tabla en BD**: `asientos_contables`

**Campos**:
- `id`: Identificador único
- `numero_asiento`: Número de asiento (único)
- `fecha`: Fecha del asiento
- `descripcion`: Descripción/glosa del asiento
- `tipo`: Tipo de asiento (VENTA, COSTO, ACTIVO, PASIVO, INGRESO, EGRESO)
- `total_debe`: Total del debe (calculado)
- `total_haber`: Total del haber (calculado)
- `factura_id`: ID de la factura relacionada (opcional)
- `created_at`: Fecha de creación

## 5. accounting_entries (PartidaContable)

**Propósito**: Detalle del asiento (ID cuenta, valor Debe, valor Haber)

**Entidad**: `backend-nestjs/src/modules/contabilidad/entities/partida-contable.entity.ts`

**Tabla en BD**: `partidas_contables`

**Campos**:
- `id`: Identificador único
- `asiento_id`: ID del asiento contable relacionado
- `cuenta_id`: ID de la cuenta contable
- `debe`: Valor del debe
- `haber`: Valor del haber
- `descripcion`: Descripción de la partida
- `created_at`: Fecha de creación

## Relaciones

### Facturas ↔ Vouchers
- Una factura puede tener un voucher (relación 1:1)
- El voucher almacena la información del comprobante electrónico

### Facturas ↔ Asientos Contables
- Una factura puede generar un asiento contable (relación 1:1 o 1:N dependiendo del caso)
- Los asientos contables se generan automáticamente al crear una factura

### Asientos Contables ↔ Partidas Contables
- Un asiento contable tiene múltiples partidas (relación 1:N)
- Las partidas contables representan el detalle del asiento (Partida Doble)

### Partidas Contables ↔ Cuentas Contables
- Una partida contable está relacionada con una cuenta contable
- Esto permite identificar qué cuenta se está moviendo en cada partida

## Notas de Implementación

1. **Nombres de tablas**: 
   - Las tablas en PostgreSQL siguen el estándar snake_case
   - Las entidades en TypeScript usan PascalCase
   - Se mantiene compatibilidad con nombres existentes donde aplica

2. **Vouchers vs Facturas**:
   - La tabla `facturas` ya tiene algunos campos relacionados con SRI
   - Se crea `vouchers` como tabla complementaria para almacenar específicamente:
     - XMLs (generado, firmado, autorizado)
     - PDF del RIDE
     - Estado detallado del SRI
   - Esto permite mejor organización y separación de responsabilidades

3. **Productos**:
   - Se agregó el campo `tipo_impuesto` para soportar IVA 0%, 15% y Exento
   - Este campo es esencial para el cálculo correcto de impuestos en las facturas

4. **Contabilidad**:
   - `asientos_contables` = `accounting_journal` (cabecera)
   - `partidas_contables` = `accounting_entries` (detalle)
   - Se mantiene la estructura de Partida Doble donde debe = haber


















