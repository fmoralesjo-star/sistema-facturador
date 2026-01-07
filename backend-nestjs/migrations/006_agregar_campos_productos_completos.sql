-- Migración: Agregar campos completos a la tabla productos
-- Fecha: 2024
-- Descripción: Agrega todos los campos necesarios para el sistema de productos completo

DO $$
BEGIN
    -- Agregar num_movimiento
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='num_movimiento') THEN
        ALTER TABLE productos ADD COLUMN num_movimiento VARCHAR(50);
        RAISE NOTICE 'Columna num_movimiento agregada.';
    END IF;

    -- Agregar fecha_movimiento
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='fecha_movimiento') THEN
        ALTER TABLE productos ADD COLUMN fecha_movimiento DATE;
        RAISE NOTICE 'Columna fecha_movimiento agregada.';
    END IF;

    -- Agregar grupo_comercial
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='grupo_comercial') THEN
        ALTER TABLE productos ADD COLUMN grupo_comercial VARCHAR(100);
        RAISE NOTICE 'Columna grupo_comercial agregada.';
    END IF;

    -- Agregar referencia
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='referencia') THEN
        ALTER TABLE productos ADD COLUMN referencia VARCHAR(100);
        RAISE NOTICE 'Columna referencia agregada.';
    END IF;

    -- Agregar coleccion
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='coleccion') THEN
        ALTER TABLE productos ADD COLUMN coleccion VARCHAR(100);
        RAISE NOTICE 'Columna coleccion agregada.';
    END IF;

    -- Agregar categoria
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='categoria') THEN
        ALTER TABLE productos ADD COLUMN categoria VARCHAR(100);
        RAISE NOTICE 'Columna categoria agregada.';
    END IF;

    -- Agregar talla
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='talla') THEN
        ALTER TABLE productos ADD COLUMN talla VARCHAR(50);
        RAISE NOTICE 'Columna talla agregada.';
    END IF;

    -- Agregar color
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='color') THEN
        ALTER TABLE productos ADD COLUMN color VARCHAR(50);
        RAISE NOTICE 'Columna color agregada.';
    END IF;

    -- Agregar desc_color
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='desc_color') THEN
        ALTER TABLE productos ADD COLUMN desc_color VARCHAR(100);
        RAISE NOTICE 'Columna desc_color agregada.';
    END IF;

    -- Agregar cod_barras
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='cod_barras') THEN
        ALTER TABLE productos ADD COLUMN cod_barras VARCHAR(100);
        CREATE INDEX IF NOT EXISTS "IDX_productos_cod_barras" ON productos(cod_barras);
        RAISE NOTICE 'Columna cod_barras agregada.';
    END IF;

    -- Agregar precio_costo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='precio_costo') THEN
        ALTER TABLE productos ADD COLUMN precio_costo DECIMAL(10, 2);
        RAISE NOTICE 'Columna precio_costo agregada.';
    END IF;

    -- Agregar unidad
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productos' AND column_name='unidad') THEN
        ALTER TABLE productos ADD COLUMN unidad VARCHAR(20);
        RAISE NOTICE 'Columna unidad agregada.';
    END IF;

    RAISE NOTICE 'Migración completada: Todos los campos agregados a la tabla productos.';
END $$;
















