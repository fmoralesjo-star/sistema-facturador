-- Migración: Agregar sistema de ubicaciones (Warehouses/Bins)
-- Fecha: 2024
-- Descripción: Agrega tablas para gestionar ubicaciones (bodegas, pasillos, estantes) y stock por ubicación

-- Crear tabla de ubicaciones
CREATE TABLE IF NOT EXISTS ubicaciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(50) UNIQUE,
    tipo VARCHAR(50) DEFAULT 'BODEGA',
    descripcion TEXT,
    direccion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de relación productos-ubicaciones (stock por ubicación)
CREATE TABLE IF NOT EXISTS productos_ubicaciones (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    ubicacion_id INTEGER NOT NULL REFERENCES ubicaciones(id) ON DELETE CASCADE,
    stock INTEGER DEFAULT 0,
    stock_minimo INTEGER,
    stock_maximo INTEGER,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(producto_id, ubicacion_id)
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_ubicaciones_producto ON productos_ubicaciones(producto_id);
CREATE INDEX IF NOT EXISTS idx_productos_ubicaciones_ubicacion ON productos_ubicaciones(ubicacion_id);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_activa ON ubicaciones(activa);
CREATE INDEX IF NOT EXISTS idx_ubicaciones_tipo ON ubicaciones(tipo);

-- Agregar comentarios a las tablas
COMMENT ON TABLE ubicaciones IS 'Almacena información de ubicaciones físicas (bodegas, pasillos, estantes, etc.)';
COMMENT ON TABLE productos_ubicaciones IS 'Relación entre productos y ubicaciones con stock específico por ubicación';
COMMENT ON COLUMN ubicaciones.tipo IS 'Tipo de ubicación: BODEGA, PASILLO, ESTANTE, EXTERNA, OTRO';
COMMENT ON COLUMN productos_ubicaciones.stock IS 'Cantidad de stock del producto en esta ubicación específica';

-- Verificar la migración
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('ubicaciones', 'productos_ubicaciones')
ORDER BY table_name, ordinal_position;
















