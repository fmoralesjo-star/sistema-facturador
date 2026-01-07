# Módulo de Usuarios y Roles

Este módulo gestiona los usuarios del sistema y sus roles con permisos.

## Roles Predefinidos

El sistema incluye los siguientes roles predefinidos:

1. **admin** - Administrador del sistema con acceso completo a todos los módulos
2. **gestor de sistema** - Gestor con acceso completo para configuración y mantenimiento
3. **gerente** - Gerente con acceso a módulos operativos y reportes
4. **vendedor** - Vendedor con acceso a facturación, clientes y productos
5. **contador** - Contador con acceso a contabilidad, facturación y reportes

## Instalación

### 1. Instalar dependencias

```bash
npm install bcrypt @types/bcrypt
```

### 2. Crear las tablas en la base de datos

Las tablas se crearán automáticamente mediante TypeORM cuando inicies el servidor.

### 3. Insertar roles predefinidos

Ejecuta el script SQL para crear los roles:

```bash
psql -U facturador -d facturador_db -f src/modules/usuarios/scripts/crear-roles.sql
```

O ejecuta manualmente las consultas SQL del archivo `scripts/crear-roles.sql`.

## Estructura de Base de Datos

### Tabla: roles
- `id` - ID del rol (PK)
- `nombre` - Nombre único del rol
- `descripcion` - Descripción del rol
- `created_at` - Fecha de creación
- `updated_at` - Fecha de actualización

### Tabla: usuarios
- `id` - ID del usuario (PK)
- `nombre_usuario` - Nombre de usuario único
- `nombre_completo` - Nombre completo
- `password` - Contraseña hasheada con bcrypt
- `email` - Email del usuario
- `activo` - Estado activo/inactivo (1/0)
- `rol_id` - ID del rol asignado (FK)
- `created_at` - Fecha de creación
- `updated_at` - Fecha de actualización

### Tabla: usuario_permisos
- `id` - ID del permiso (PK)
- `usuario_id` - ID del usuario (FK)
- `modulo` - Nombre del módulo
- `tiene_acceso` - Si tiene acceso (1/0)
- `created_at` - Fecha de creación
- `updated_at` - Fecha de actualización

## Permisos por Rol

### Admin
- facturacion
- contabilidad
- clientes
- productos
- inventario
- compras
- admin
- reportes

### Gestor de Sistema
- facturacion
- contabilidad
- clientes
- productos
- inventario
- compras
- admin
- reportes

### Gerente
- facturacion
- contabilidad
- clientes
- productos
- inventario
- compras
- reportes

### Vendedor
- facturacion
- clientes
- productos

### Contador
- contabilidad
- facturacion
- reportes

## API Endpoints

### Usuarios
- `GET /usuarios` - Listar todos los usuarios
- `GET /usuarios/:id` - Obtener un usuario
- `POST /usuarios` - Crear un usuario
- `PUT /usuarios/:id` - Actualizar un usuario
- `DELETE /usuarios/:id` - Eliminar un usuario
- `GET /usuarios/:id/permisos` - Obtener permisos de un usuario
- `PUT /usuarios/:id/permisos` - Actualizar permisos de un usuario

### Roles
- `GET /usuarios/roles` - Listar todos los roles
- `GET /usuarios/roles/:id` - Obtener un rol

## Uso en el Frontend

El módulo de administración incluye una interfaz para gestionar usuarios y asignar roles. Al asignar un rol a un usuario, los permisos se aplican automáticamente según la configuración del rol.



