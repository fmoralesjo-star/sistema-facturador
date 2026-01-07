-- Migración: Crear Producto de Ejemplo - Prenda de Ropa Talla XS
-- Fecha: 2024
-- Descripción: Inserta un producto de ejemplo completo con todos los campos configurados

-- Insertar producto de ejemplo: Prenda de ropa talla XS
INSERT INTO productos (
    codigo,
    sku,
    nombre,
    descripcion,
    precio,
    stock,
    tipo_impuesto,
    activo,
    punto_reorden,
    stock_seguridad,
    tiempo_entrega_dias,
    costo_promedio,
    created_at,
    updated_at
) VALUES (
    'PRENDA-001',
    'PRENDA-XS-001',
    'Camiseta Básica - Talla XS',
    'Camiseta de algodón 100%, color blanco, talla XS. Ideal para uso diario. Material suave y cómodo.',
    25.99,
    45,
    '12',
    true,
    30,  -- Punto de reorden: alerta cuando stock baja de 30 unidades
    15,  -- Stock de seguridad: colchón de 15 unidades
    7,   -- Tiempo de entrega del proveedor: 7 días
    15.50, -- Costo promedio (FIFO)
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (codigo) DO NOTHING;

-- Obtener el ID del producto insertado
DO $$
DECLARE
    producto_id INTEGER;
BEGIN
    SELECT id INTO producto_id FROM productos WHERE codigo = 'PRENDA-001';
    
    IF producto_id IS NOT NULL THEN
        RAISE NOTICE 'Producto creado con ID: %', producto_id;
        
        -- Crear lotes de ejemplo para FIFO
        -- Lote 1: Entrada más antigua (FIFO - se vende primero)
        INSERT INTO lotes_inventario (
            producto_id,
            numero_lote,
            fecha_entrada,
            fecha_vencimiento,
            cantidad_inicial,
            cantidad_disponible,
            costo_unitario,
            precio_venta,
            proveedor,
            referencia_compra,
            created_at
        ) VALUES (
            producto_id,
            'LOTE-2024-001',
            CURRENT_DATE - INTERVAL '30 days', -- Hace 30 días
            NULL,
            30,
            20, -- 20 unidades disponibles (10 ya vendidas)
            14.00,
            25.99,
            'Proveedor Textil S.A.',
            'OC-2024-001',
            CURRENT_TIMESTAMP
        ) ON CONFLICT DO NOTHING;
        
        -- Lote 2: Entrada más reciente
        INSERT INTO lotes_inventario (
            producto_id,
            numero_lote,
            fecha_entrada,
            fecha_vencimiento,
            cantidad_inicial,
            cantidad_disponible,
            costo_unitario,
            precio_venta,
            proveedor,
            referencia_compra,
            created_at
        ) VALUES (
            producto_id,
            'LOTE-2024-002',
            CURRENT_DATE - INTERVAL '10 days', -- Hace 10 días
            NULL,
            25,
            25, -- Todas disponibles
            17.00,
            25.99,
            'Proveedor Textil S.A.',
            'OC-2024-002',
            CURRENT_TIMESTAMP
        ) ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Lotes de ejemplo creados para el producto';
    ELSE
        RAISE NOTICE 'El producto ya existe o no se pudo crear';
    END IF;
END $$;

-- Verificar el producto creado
SELECT 
    p.id,
    p.codigo,
    p.sku,
    p.nombre,
    p.descripcion,
    p.precio,
    p.stock,
    p.punto_reorden,
    p.stock_seguridad,
    p.tiempo_entrega_dias,
    p.costo_promedio,
    (SELECT COUNT(*) FROM lotes_inventario WHERE producto_id = p.id) as total_lotes
FROM productos p
WHERE p.codigo = 'PRENDA-001';

-- Mostrar los lotes del producto
SELECT 
    l.id,
    l.numero_lote,
    l.fecha_entrada,
    l.cantidad_inicial,
    l.cantidad_disponible,
    l.costo_unitario,
    l.proveedor
FROM lotes_inventario l
INNER JOIN productos p ON l.producto_id = p.id
WHERE p.codigo = 'PRENDA-001'
ORDER BY l.fecha_entrada ASC;
















