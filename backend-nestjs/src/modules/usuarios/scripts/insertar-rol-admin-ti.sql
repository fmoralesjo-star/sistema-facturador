-- Script para insertar el rol "Administrador de TI" y "Dueño"
-- Ejecutar este script en la base de datos PostgreSQL

-- Insertar rol "Administrador de TI" si no existe
INSERT INTO roles (nombre, descripcion, created_at, updated_at)
SELECT 
    'Administrador de TI',
    'Administrador de TI con acceso exclusivo a operatividad técnica, sin acceso a información financiera',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE nombre = 'Administrador de TI'
);

-- Insertar rol "Dueño" si no existe
INSERT INTO roles (nombre, descripcion, created_at, updated_at)
SELECT 
    'Dueño',
    'Dueño de la empresa con acceso completo y autorización para aprobar solicitudes de roles',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE nombre = 'Dueño'
);

-- Verificar que se insertaron correctamente
SELECT id, nombre, descripcion FROM roles WHERE nombre IN ('Administrador de TI', 'Dueño');










