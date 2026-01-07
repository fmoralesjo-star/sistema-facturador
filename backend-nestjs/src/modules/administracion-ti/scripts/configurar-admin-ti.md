# Guía para Configurar Administrador de TI

## Paso 1: Verificar que el backend esté corriendo

El backend debe estar activo para que el módulo funcione.

## Paso 2: Crear los roles necesarios

Los roles se crean automáticamente al iniciar el backend, pero puedes verificar ejecutando:

```sql
-- Verificar roles existentes
SELECT id, nombre, descripcion FROM roles;
```

Si no existen, se crearán automáticamente la próxima vez que inicies el backend.

## Paso 3: Asignar rol "Administrador de TI" a un usuario

### Opción A: Desde la base de datos

```sql
-- 1. Buscar tu usuario por email
SELECT id, nombre_usuario, email, rol_id FROM usuarios WHERE email = 'tu-email@ejemplo.com';

-- 2. Obtener el ID del rol "Administrador de TI"
SELECT id FROM roles WHERE nombre = 'Administrador de TI';

-- 3. Asignar el rol (reemplaza USER_ID y ROLE_ID con los valores obtenidos)
UPDATE usuarios 
SET rol_id = (SELECT id FROM roles WHERE nombre = 'Administrador de TI')
WHERE id = USER_ID;
```

### Opción B: Desde el módulo de Administración

1. Ve al módulo "Administración" (⚙️)
2. Pestaña "Usuarios"
3. Edita tu usuario
4. Selecciona el rol "Administrador de TI"
5. Guarda

## Paso 4: Verificar que funciona

1. Recarga la página con `Ctrl + Shift + R`
2. Ve al módulo "Administración de TI" (🔧)
3. Deberías poder acceder sin errores

## Solución de problemas

### Error: "Usuario no encontrado en la base de datos"
- El sistema intentará sincronizar automáticamente tu usuario desde Firebase
- Si persiste, verifica que tu email en Firebase coincida con el de la base de datos

### Error: "No tienes permisos"
- Verifica que tengas el rol "Administrador de TI" asignado
- Verifica que el rol exista en la tabla `roles`

### Error: "No se pudo conectar con el servidor"
- Verifica que el backend esté corriendo
- Verifica la URL del backend en `client/.env`










