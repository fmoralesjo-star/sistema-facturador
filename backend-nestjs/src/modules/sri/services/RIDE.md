# RIDE - Representación Impresa del Documento Electrónico

## Descripción

El RIDE es el documento PDF que representa visualmente una factura electrónica. Este servicio genera automáticamente un PDF con toda la información requerida por el SRI (Servicio de Rentas Internas de Ecuador).

## Características Implementadas

### ✅ Logo de la Empresa
- El sistema busca el logo de la empresa en la ruta `uploads/logos/`
- Nombres de archivo buscados:
  - `{RUC}.png` o `{RUC}.jpg`
  - `logo.png` o `logo.jpg`
- Si no se encuentra logo, el PDF se genera sin logo

### ✅ Información del Emisor
- Razón Social
- RUC
- Dirección Matriz
- Teléfono
- Email

### ✅ Información del Receptor (Cliente)
- Nombre/Razón Social
- RUC/Cédula
- Dirección

### ✅ Cuadro de Totales
- **Base Imponible 0%**: Productos con IVA 0% o exentos
- **Base Imponible IVA**: Productos con IVA 15%
- **IVA 15%**: Impuesto calculado
- **Total**: Suma total de la factura

### ✅ Código de Barras
- **Clave de Acceso**: Se muestra la clave de acceso de 49 dígitos formateada
- **Nota**: Para código de barras Code128 real, se puede implementar usando `jsbarcode` en el frontend o una librería compatible con Node.js

### ✅ Información Adicional
- Fecha de Emisión
- Número de Autorización (si está autorizado)
- Fecha de Autorización (si está autorizado)
- Ambiente (Producción/Pruebas)

## Uso

### Endpoint para Obtener RIDE

```http
GET /api/sri/ride/:facturaId
```

**Respuesta**: Archivo PDF descargable

**Ejemplo**:
```bash
curl http://localhost:3001/api/sri/ride/1 --output RIDE.pdf
```

### Endpoint para Regenerar RIDE

```http
POST /api/sri/ride/:facturaId/generar
```

**Respuesta**: Archivo PDF descargable (fuerza la regeneración)

## Flujo de Generación

1. **Al crear una factura**:
   - Se genera el XML
   - Se firma digitalmente
   - Se envía al SRI
   - Cuando el SRI autoriza, se puede generar el RIDE

2. **Generación del RIDE**:
   - Se obtiene la factura con todos sus detalles
   - Se obtiene la empresa activa
   - Se obtiene el voucher (con clave de acceso)
   - Se calculan las bases imponibles
   - Se genera el PDF
   - Se guarda en `uploads/rides/`
   - Se actualiza el voucher con la ruta del PDF

## Estructura del PDF

```
┌─────────────────────────────────────┐
│         [LOGO EMPRESA]              │
│                                     │
│     COMPROBANTE DE VENTA            │
│     R.U.C.: 1234567890001          │
│     FACTURA No. FAC-001            │
│     Clave de Acceso: 49 dígitos    │
├─────────────────────────────────────┤
│ EMISOR:                             │
│ Razón Social: ...                   │
│ Dirección: ...                      │
│ Teléfono: ...                       │
├─────────────────────────────────────┤
│ CLIENTE:                            │
│ Nombre: ...                         │
│ R.U.C./C.I.: ...                    │
│ Dirección: ...                      │
├─────────────────────────────────────┤
│ [Tabla de Productos]                │
│ Código | Descripción | Cant | ...  │
├─────────────────────────────────────┤
│ TOTALES:                            │
│ Base Imponible 0%: $XXX.XX         │
│ Base Imponible IVA: $XXX.XX        │
│ IVA 15%: $XXX.XX                   │
│ ──────────────────────────          │
│ TOTAL: $XXX.XX                      │
├─────────────────────────────────────┤
│ Fecha Emisión: DD/MM/YYYY          │
│ Nro. Autorización: ...              │
│ Fecha Autorización: DD/MM/YYYY     │
│ Ambiente: PRODUCCIÓN/PRUEBAS       │
├─────────────────────────────────────┤
│     CÓDIGO DE ACCESO                │
│  XXXX XXXX XXXX XXXX ...           │
└─────────────────────────────────────┘
```

## Mejoras Futuras

### Código de Barras Code128 Real

Para implementar código de barras Code128 real, se puede:

1. **Opción 1: Frontend (Recomendado)**
   - Usar `jsbarcode` en React
   - Generar el código de barras como SVG/Canvas
   - Incluirlo en el PDF generado desde el frontend

2. **Opción 2: Backend con Canvas**
   - Usar `canvas` y una librería de código de barras compatible
   - Generar la imagen del código de barras
   - Insertarla en el PDF usando pdfkit

3. **Opción 3: Servicio Externo**
   - Usar un servicio web que genere código de barras
   - Descargar la imagen y insertarla en el PDF

## Ubicación de Archivos

- **RIDEs generados**: `backend-nestjs/uploads/rides/`
- **Logos de empresas**: `backend-nestjs/uploads/logos/`
- **Ruta guardada en BD**: Se almacena en `vouchers.ruta_pdf`

## Validaciones

- La factura debe existir
- Debe tener un voucher con clave de acceso
- Debe existir una empresa activa
- Los detalles de la factura deben estar cargados

## Errores Comunes

1. **"No hay empresa configurada"**: Configurar una empresa activa
2. **"La factura no tiene voucher"**: Asegurarse de que la factura tenga clave de acceso generada
3. **"No se pudo generar el RIDE"**: Verificar permisos de escritura en `uploads/rides/`


















