-- Script SQL para verificar y crear roles si no existen
-- Ejecutar este script directamente en PostgreSQL

-- Verificar roles existentes
SELECT id, nombre, descripcion, created_at 
FROM roles 
ORDER BY nombre;

-- Si no hay roles, insertarlos
INSERT INTO roles (nombre, descripcion, created_at, updated_at)
SELECT 'admin', 'Administrador del sistema con acceso completo a todos los módulos', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'admin');

INSERT INTO roles (nombre, descripcion, created_at, updated_at)
SELECT 'gestor de sistema', 'Gestor de sistema con acceso completo para configuración y mantenimiento', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'gestor de sistema');

INSERT INTO roles (nombre, descripcion, created_at, updated_at)
SELECT 'gerente', 'Gerente con acceso a módulos operativos y reportes', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'gerente');

INSERT INTO roles (nombre, descripcion, created_at, updated_at)
SELECT 'vendedor', 'Vendedor con acceso a facturación, clientes y productos', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'vendedor');

INSERT INTO roles (nombre, descripcion, created_at, updated_at)
SELECT 'contador', 'Contador con acceso a contabilidad, facturación y reportes', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'contador');

INSERT INTO roles (nombre, descripcion, created_at, updated_at)
SELECT 'Administrador de TI', 'Administrador de TI con acceso exclusivo a operatividad técnica, sin acceso a información financiera', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'Administrador de TI');

INSERT INTO roles (nombre, descripcion, created_at, updated_at)
SELECT 'Dueño', 'Dueño de la empresa con acceso completo y autorización para aprobar solicitudes de roles', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'Dueño');

-- Verificar que se insertaron correctamente
SELECT id, nombre, descripcion 
FROM roles 
ORDER BY nombre;










