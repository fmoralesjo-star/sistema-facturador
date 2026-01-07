# Migración: Agregar Campo SKU a Productos

## Descripción

Esta migración agrega el campo **SKU (Stock Keeping Unit)** a la tabla `productos` en la base de datos.

El SKU es un identificador único a nivel de producto/variante que permite una mejor gestión de inventario.

## Archivos de Migración

- `001_agregar_sku_productos.sql` - Script SQL de migración
- `EJECUTAR-MIGRACION-SKU.bat` - Script para ejecutar la migración en Windows

## Requisitos

- PostgreSQL instalado y corriendo
- Acceso a la base de datos del sistema facturador
- Credenciales de acceso a PostgreSQL

## Formas de Ejecutar la Migración

### Opción 1: Usando el Script Automático (Windows)

1. Abre una terminal en la carpeta `backend-nestjs`
2. Ejecuta:
   ```bash
   migrations\EJECUTAR-MIGRACION-SKU.bat
   ```

### Opción 2: Usando psql directamente

1. Abre una terminal
2. Ejecuta:
   ```bash
   psql -h localhost -U tu_usuario -d facturador_db -f migrations/001_agregar_sku_productos.sql
   ```

### Opción 3: Desde pgAdmin o DBeaver

1. Abre tu cliente de PostgreSQL (pgAdmin, DBeaver, etc.)
2. Conéctate a la base de datos `facturador_db`
3. Abre y ejecuta el archivo `001_agregar_sku_productos.sql`

## Qué Hace la Migración

1. **Agrega la columna SKU**: Crea la columna `sku` de tipo VARCHAR(100) en la tabla `productos`
2. **Crea índice único**: Crea un índice único para garantizar que no haya SKUs duplicados (permite múltiples NULLs)
3. **Agrega comentario**: Documenta la columna con una descripción

## Verificación

Después de ejecutar la migración, puedes verificar que se aplicó correctamente ejecutando:

```sql
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'productos' 
AND column_name = 'sku';
```

Deberías ver:
- `column_name`: sku
- `data_type`: character varying
- `character_maximum_length`: 100
- `is_nullable`: YES

## Notas Importantes

- ✅ La migración es **idempotente**: Puede ejecutarse múltiples veces sin causar errores
- ✅ El campo SKU es **opcional** (nullable): Los productos existentes no necesitan SKU inmediatamente
- ✅ El índice único permite múltiples valores NULL, pero solo un valor único por SKU no-nulo
- ⚠️ Si ya tienes productos con SKUs duplicados, la migración fallará al crear el índice único

## Solución de Problemas

### Error: "La columna ya existe"
- Esto es normal si ya ejecutaste la migración antes
- La migración está diseñada para ser segura si se ejecuta múltiples veces

### Error: "Ya existe un índice con ese nombre"
- El índice ya fue creado previamente
- Puedes ignorar este mensaje

### Error: "No se puede conectar a PostgreSQL"
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en el archivo `.env`
- Verifica que la base de datos `facturador_db` exista

## Después de la Migración

Una vez completada la migración:

1. Reinicia el servidor backend si está corriendo
2. Los productos nuevos pueden incluir SKU desde el formulario
3. Los productos existentes pueden actualizarse para agregar SKU
4. El campo SKU aparecerá en:
   - Formulario de productos
   - Tabla de productos
   - Tabla de inventario
   - Búsquedas en inventario
   - Kardex de productos

## Rollback (Revertir)

Si necesitas revertir la migración (eliminar el campo SKU):

```sql
-- Eliminar el índice único
DROP INDEX IF EXISTS UQ_productos_sku;

-- Eliminar la columna
ALTER TABLE productos DROP COLUMN IF EXISTS sku;
```

**⚠️ ADVERTENCIA**: Esto eliminará todos los datos de SKU. Asegúrate de hacer un backup antes.
















