-- Migración: Valoración FIFO/PEPS y Alertas de Inventario
-- Fecha: 2024
-- Descripción: Agrega campos para valoración FIFO, punto de reorden y stock de seguridad

-- ========== AGREGAR CAMPOS A PRODUCTOS ==========

-- Punto de Reorden
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'punto_reorden'
    ) THEN
        ALTER TABLE productos ADD COLUMN punto_reorden INTEGER;
        RAISE NOTICE 'Columna punto_reorden agregada';
    END IF;
END $$;

-- Stock de Seguridad
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'stock_seguridad'
    ) THEN
        ALTER TABLE productos ADD COLUMN stock_seguridad INTEGER;
        RAISE NOTICE 'Columna stock_seguridad agregada';
    END IF;
END $$;

-- Tiempo de Entrega (días)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'tiempo_entrega_dias'
    ) THEN
        ALTER TABLE productos ADD COLUMN tiempo_entrega_dias INTEGER;
        RAISE NOTICE 'Columna tiempo_entrega_dias agregada';
    END IF;
END $$;

-- Costo Promedio (para valoración)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'costo_promedio'
    ) THEN
        ALTER TABLE productos ADD COLUMN costo_promedio DECIMAL(10,2);
        RAISE NOTICE 'Columna costo_promedio agregada';
    END IF;
END $$;

-- ========== TABLA DE LOTES (FIFO/PEPS) ==========

CREATE TABLE IF NOT EXISTS lotes_inventario (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    numero_lote VARCHAR(100),
    fecha_entrada DATE NOT NULL,
    fecha_vencimiento DATE,
    cantidad_inicial INTEGER NOT NULL,
    cantidad_disponible INTEGER NOT NULL,
    costo_unitario DECIMAL(10,2) NOT NULL,
    precio_venta DECIMAL(10,2),
    proveedor VARCHAR(100),
    referencia_compra VARCHAR(50),
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para FIFO
CREATE INDEX IF NOT EXISTS idx_lotes_producto_fecha ON lotes_inventario(producto_id, fecha_entrada);
CREATE INDEX IF NOT EXISTS idx_lotes_disponibles ON lotes_inventario(producto_id, cantidad_disponible) WHERE cantidad_disponible > 0;
CREATE INDEX IF NOT EXISTS idx_lotes_vencimiento ON lotes_inventario(fecha_vencimiento) WHERE fecha_vencimiento IS NOT NULL;

-- Comentarios
COMMENT ON COLUMN productos.punto_reorden IS 'Punto de reorden: alerta automática cuando el stock baja de este valor';
COMMENT ON COLUMN productos.stock_seguridad IS 'Stock de seguridad: colchón extra para evitar quiebres de stock';
COMMENT ON COLUMN productos.tiempo_entrega_dias IS 'Tiempo de entrega del proveedor en días (para cálculo de punto de reorden)';
COMMENT ON COLUMN productos.costo_promedio IS 'Costo promedio calculado por método FIFO/PEPS';
COMMENT ON TABLE lotes_inventario IS 'Tracking de lotes para valoración FIFO/PEPS (First In First Out)';

-- Verificar migración
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'productos' 
AND column_name IN ('punto_reorden', 'stock_seguridad', 'tiempo_entrega_dias', 'costo_promedio')
ORDER BY column_name;

SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_name = 'lotes_inventario';
















