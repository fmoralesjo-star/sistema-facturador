-- Migración: Agregar campo SKU a la tabla productos
-- Fecha: 2024
-- Descripción: Agrega el campo SKU (Stock Keeping Unit) como identificador único a nivel de producto/variante

-- Verificar si la columna ya existe antes de agregarla
DO $$
BEGIN
    -- Agregar la columna SKU si no existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'productos' 
        AND column_name = 'sku'
    ) THEN
        ALTER TABLE productos 
        ADD COLUMN sku VARCHAR(100);
        
        RAISE NOTICE 'Columna SKU agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna SKU ya existe';
    END IF;
END $$;

-- Crear índice único para SKU (permitiendo valores NULL)
-- PostgreSQL permite múltiples NULLs en índices únicos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'productos' 
        AND indexname = 'UQ_productos_sku'
    ) THEN
        CREATE UNIQUE INDEX UQ_productos_sku 
        ON productos(sku) 
        WHERE sku IS NOT NULL;
        
        RAISE NOTICE 'Índice único UQ_productos_sku creado exitosamente';
    ELSE
        RAISE NOTICE 'El índice UQ_productos_sku ya existe';
    END IF;
END $$;

-- Agregar comentario a la columna
COMMENT ON COLUMN productos.sku IS 'Stock Keeping Unit - Identificador único a nivel de producto/variante';

-- Verificar la migración
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'productos' 
AND column_name = 'sku';
















