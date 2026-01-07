-- Migración: Agregar campo estado_stock a productos_ubicaciones
-- Fecha: 2024
-- Descripción: Agrega el campo estado_stock para gestionar estados del stock (Disponible, Reservado, Dañado/Merma, En Tránsito)

-- Verificar si la columna ya existe antes de agregarla
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'productos_ubicaciones' 
        AND column_name = 'estado_stock'
    ) THEN
        ALTER TABLE productos_ubicaciones 
        ADD COLUMN estado_stock VARCHAR(20) DEFAULT 'DISPONIBLE';
        
        -- Actualizar registros existentes al estado por defecto
        UPDATE productos_ubicaciones 
        SET estado_stock = 'DISPONIBLE' 
        WHERE estado_stock IS NULL;
        
        -- Agregar constraint para valores válidos
        ALTER TABLE productos_ubicaciones 
        ADD CONSTRAINT chk_estado_stock 
        CHECK (estado_stock IN ('DISPONIBLE', 'RESERVADO', 'DANADO_MERMA', 'EN_TRANSITO'));
        
        RAISE NOTICE 'Columna estado_stock agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna estado_stock ya existe';
    END IF;
END $$;

-- Agregar comentario a la columna
COMMENT ON COLUMN productos_ubicaciones.estado_stock IS 'Estado del stock: DISPONIBLE (Listo para venta), RESERVADO (Vendido online pero no despachado), DANADO_MERMA (En espera de liquidación), EN_TRANSITO (Pedidos al proveedor que aún no llegan)';

-- Crear índice para mejorar búsquedas por estado
CREATE INDEX IF NOT EXISTS idx_productos_ubicaciones_estado ON productos_ubicaciones(estado_stock);

-- Verificar la migración
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'productos_ubicaciones' 
AND column_name = 'estado_stock';
















