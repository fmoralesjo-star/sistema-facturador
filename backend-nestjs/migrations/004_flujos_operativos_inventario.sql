-- Migración: Flujos Operativos Críticos de Inventario
-- Fecha: 2024
-- Descripción: Crea todas las tablas para los flujos operativos (Órdenes de Compra, Albaranes, Transferencias, Ajustes, Picking, Conteos Cíclicos)

-- ========== A. RECEPCIÓN Y COMPRAS (INBOUND) ==========

-- Tabla de Órdenes de Compra
CREATE TABLE IF NOT EXISTS ordenes_compra (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(50) UNIQUE NOT NULL,
    fecha_orden DATE NOT NULL,
    fecha_esperada DATE,
    proveedor VARCHAR(100),
    estado VARCHAR(50) DEFAULT 'PENDIENTE',
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Detalles de Órdenes de Compra
CREATE TABLE IF NOT EXISTS ordenes_compra_detalles (
    id SERIAL PRIMARY KEY,
    orden_compra_id INTEGER NOT NULL REFERENCES ordenes_compra(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    cantidad_pedida INTEGER NOT NULL,
    cantidad_recibida INTEGER DEFAULT 0,
    precio_unitario DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Albaranes
CREATE TABLE IF NOT EXISTS albaranes (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(50) UNIQUE NOT NULL,
    fecha_recepcion DATE NOT NULL,
    orden_compra_id INTEGER REFERENCES ordenes_compra(id),
    estado VARCHAR(50) DEFAULT 'PENDIENTE',
    observaciones TEXT,
    usuario_recepcion VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Detalles de Albaranes (Conciliación)
CREATE TABLE IF NOT EXISTS albaranes_detalles (
    id SERIAL PRIMARY KEY,
    albaran_id INTEGER NOT NULL REFERENCES albaranes(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    cantidad_esperada INTEGER NOT NULL,
    cantidad_recibida INTEGER NOT NULL,
    cantidad_faltante INTEGER DEFAULT 0,
    cantidad_danada INTEGER DEFAULT 0,
    estado VARCHAR(50) DEFAULT 'OK',
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== B. MOVIMIENTOS DE INVENTARIO ==========

-- Tabla de Transferencias entre Tiendas
CREATE TABLE IF NOT EXISTS transferencias (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(50) UNIQUE NOT NULL,
    fecha DATE NOT NULL,
    origen VARCHAR(100) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    estado VARCHAR(50) DEFAULT 'PENDIENTE',
    usuario_envio VARCHAR(100),
    usuario_recepcion VARCHAR(100),
    fecha_envio DATE,
    fecha_recepcion DATE,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Detalles de Transferencias
CREATE TABLE IF NOT EXISTS transferencias_detalles (
    id SERIAL PRIMARY KEY,
    transferencia_id INTEGER NOT NULL REFERENCES transferencias(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL,
    cantidad_recibida INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Ajustes Manuales (con motivo y usuario responsable)
CREATE TABLE IF NOT EXISTS ajustes_inventario (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(50) UNIQUE NOT NULL,
    fecha DATE NOT NULL,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    cantidad_anterior INTEGER NOT NULL,
    cantidad_nueva INTEGER NOT NULL,
    diferencia INTEGER NOT NULL,
    motivo VARCHAR(50) NOT NULL,
    motivo_detalle TEXT,
    usuario_responsable VARCHAR(100) NOT NULL,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== C. DESPACHO Y VENTAS (OUTBOUND) ==========

-- Tabla de Picking & Packing
CREATE TABLE IF NOT EXISTS pickings (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(50) UNIQUE NOT NULL,
    fecha DATE NOT NULL,
    orden_venta VARCHAR(50),
    estado VARCHAR(50) DEFAULT 'PENDIENTE',
    operario VARCHAR(100),
    fecha_inicio TIMESTAMP,
    fecha_completado TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Detalles de Picking (con guía de ubicación)
CREATE TABLE IF NOT EXISTS pickings_detalles (
    id SERIAL PRIMARY KEY,
    picking_id INTEGER NOT NULL REFERENCES pickings(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    ubicacion_id INTEGER REFERENCES ubicaciones(id),
    cantidad_solicitada INTEGER NOT NULL,
    cantidad_picked INTEGER DEFAULT 0,
    estado VARCHAR(50) DEFAULT 'PENDIENTE',
    orden_picking INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== D. AUDITORÍA (STOCK TAKING) ==========

-- Tabla de Conteos Cíclicos
CREATE TABLE IF NOT EXISTS conteos_ciclicos (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(50) UNIQUE NOT NULL,
    fecha DATE NOT NULL,
    categoria VARCHAR(100),
    ubicacion VARCHAR(100),
    estado VARCHAR(50) DEFAULT 'PENDIENTE',
    usuario_responsable VARCHAR(100),
    fecha_inicio TIMESTAMP,
    fecha_completado TIMESTAMP,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Detalles de Conteos Cíclicos
CREATE TABLE IF NOT EXISTS conteos_ciclicos_detalles (
    id SERIAL PRIMARY KEY,
    conteo_id INTEGER NOT NULL REFERENCES conteos_ciclicos(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    cantidad_sistema INTEGER NOT NULL,
    cantidad_fisica INTEGER,
    diferencia INTEGER,
    estado VARCHAR(50) DEFAULT 'PENDIENTE',
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== ÍNDICES PARA MEJORAR RENDIMIENTO ==========

CREATE INDEX IF NOT EXISTS idx_ordenes_compra_fecha ON ordenes_compra(fecha_orden);
CREATE INDEX IF NOT EXISTS idx_ordenes_compra_estado ON ordenes_compra(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_compra_detalles_orden ON ordenes_compra_detalles(orden_compra_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_compra_detalles_producto ON ordenes_compra_detalles(producto_id);

CREATE INDEX IF NOT EXISTS idx_albaranes_fecha ON albaranes(fecha_recepcion);
CREATE INDEX IF NOT EXISTS idx_albaranes_estado ON albaranes(estado);
CREATE INDEX IF NOT EXISTS idx_albaranes_orden ON albaranes(orden_compra_id);
CREATE INDEX IF NOT EXISTS idx_albaranes_detalles_albaran ON albaranes_detalles(albaran_id);

CREATE INDEX IF NOT EXISTS idx_transferencias_fecha ON transferencias(fecha);
CREATE INDEX IF NOT EXISTS idx_transferencias_estado ON transferencias(estado);
CREATE INDEX IF NOT EXISTS idx_transferencias_origen ON transferencias(origen);
CREATE INDEX IF NOT EXISTS idx_transferencias_destino ON transferencias(destino);

CREATE INDEX IF NOT EXISTS idx_ajustes_fecha ON ajustes_inventario(fecha);
CREATE INDEX IF NOT EXISTS idx_ajustes_producto ON ajustes_inventario(producto_id);
CREATE INDEX IF NOT EXISTS idx_ajustes_motivo ON ajustes_inventario(motivo);
CREATE INDEX IF NOT EXISTS idx_ajustes_usuario ON ajustes_inventario(usuario_responsable);

CREATE INDEX IF NOT EXISTS idx_pickings_fecha ON pickings(fecha);
CREATE INDEX IF NOT EXISTS idx_pickings_estado ON pickings(estado);
CREATE INDEX IF NOT EXISTS idx_pickings_orden_venta ON pickings(orden_venta);
CREATE INDEX IF NOT EXISTS idx_pickings_detalles_picking ON pickings_detalles(picking_id);
CREATE INDEX IF NOT EXISTS idx_pickings_detalles_ubicacion ON pickings_detalles(ubicacion_id);

CREATE INDEX IF NOT EXISTS idx_conteos_fecha ON conteos_ciclicos(fecha);
CREATE INDEX IF NOT EXISTS idx_conteos_estado ON conteos_ciclicos(estado);
CREATE INDEX IF NOT EXISTS idx_conteos_categoria ON conteos_ciclicos(categoria);
CREATE INDEX IF NOT EXISTS idx_conteos_detalles_conteo ON conteos_ciclicos_detalles(conteo_id);

-- Comentarios
COMMENT ON TABLE ordenes_compra IS 'Órdenes de Compra - Comparación automática entre lo pedido y lo recibido';
COMMENT ON TABLE albaranes IS 'Albaranes - Conciliación de recepciones con registro de discrepancias';
COMMENT ON TABLE transferencias IS 'Transferencias entre tiendas - Historial de envíos y recepciones';
COMMENT ON TABLE ajustes_inventario IS 'Ajustes Manuales - Requieren motivo y usuario responsable';
COMMENT ON TABLE pickings IS 'Picking & Packing - Guía para operarios encontrar productos eficientemente';
COMMENT ON TABLE conteos_ciclicos IS 'Conteos Cíclicos - Auditoría por categoría sin cerrar tienda';

-- Verificar creación
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_name IN (
    'ordenes_compra', 'ordenes_compra_detalles',
    'albaranes', 'albaranes_detalles',
    'transferencias', 'transferencias_detalles',
    'ajustes_inventario',
    'pickings', 'pickings_detalles',
    'conteos_ciclicos', 'conteos_ciclicos_detalles'
)
ORDER BY table_name;
















