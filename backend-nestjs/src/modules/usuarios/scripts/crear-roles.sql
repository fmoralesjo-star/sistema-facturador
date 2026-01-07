-- Script para crear los roles predefinidos del sistema
-- Ejecutar este script después de crear las tablas

-- Insertar roles predefinidos
INSERT INTO roles (nombre, descripcion, created_at, updated_at) VALUES
('admin', 'Administrador del sistema con acceso completo a todos los módulos', NOW(), NOW()),
('gestor de sistema', 'Gestor de sistema con acceso completo para configuración y mantenimiento', NOW(), NOW()),
('gerente', 'Gerente con acceso a módulos operativos y reportes', NOW(), NOW()),
('vendedor', 'Vendedor con acceso a facturación, clientes y productos', NOW(), NOW()),
('contador', 'Contador con acceso a contabilidad, facturación y reportes', NOW(), NOW()),
('Administrador de TI', 'Administrador de TI con acceso exclusivo a operatividad técnica, sin acceso a información financiera', NOW(), NOW()),
('Dueño', 'Dueño de la empresa con acceso completo y autorización para aprobar solicitudes de roles', NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- Crear usuario admin por defecto si no existe (contraseña: admin123)
-- Nota: La contraseña debe ser hasheada con bcrypt antes de insertar
-- Para generar el hash, usar: bcrypt.hash('admin123', 10)
-- Por ahora se inserta sin hash, debe actualizarse después del primer login

INSERT INTO usuarios (nombre_usuario, nombre_completo, password, email, activo, rol_id, created_at, updated_at)
SELECT 
  'admin',
  'Administrador del Sistema',
  '$2b$10$rK8Z8Z8Z8Z8Z8Z8Z8Z8Z8uK8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', -- Cambiar por hash real de 'admin123'
  'admin@sistema.com',
  1,
  (SELECT id FROM roles WHERE nombre = 'admin' LIMIT 1),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE nombre_usuario = 'admin')
ON CONFLICT (nombre_usuario) DO NOTHING;



