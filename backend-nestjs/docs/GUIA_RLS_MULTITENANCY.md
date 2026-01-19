# Guía de Implementación RLS y Multi-Tenancy

Se ha implementado una arquitectura de aislamiento de datos basada en PostgreSQL RLS (Row Level Security) que funciona de forma transparente para los módulos de negocio existentes.

## 1. Infraestructura de Base de Datos

*   **Columna `tenant_id`:** Se ha añadido a todas las tablas sensibles (`productos`, `facturas`, `clientes`, etc.).
*   **Políticas RLS:** Se han activado políticas que fuerzan el filtrado:
    ```sql
    USING (tenant_id = current_app_tenant() OR current_app_superuser() = true OR tenant_id IS NULL)
    ```
*   **Funciones SQL:**
    *   `current_app_tenant()`: Lee la variable de sesión `app.current_tenant`.
    *   `current_app_superuser()`: Lee `app.is_superuser` para bypass de administración.

## 2. Middleware e Identificación

*   **TenantMiddleware:** Intercepta cada petición, extrae el subdominio (ej: `empresa1.facturador.com`) o cabecera `X-Tenant-ID`, y almacena el ID en el contexto de la petición (usando `nestjs-cls`).

## 3. Integración Transparente (Interceptor)

Para que los servicios existentes (que usan `Repository.find()`) funcionen sin cambios:

1.  Se ha instalado `@nestjs-cls/transactional`.
2.  Se ha configurado `TenancyInterceptor` como **Global Interceptor**.
3.  Este interceptor inicia una transacción para cada petición HTTP.
4.  Dentro de la transacción, ejecuta `SET LOCAL app.current_tenant = 'ID'`.
5.  TypeORM utiliza esta transacción automáticamente, por lo que todas las queries heredan el contexto y el RLS filtra los datos correctamente.

## 4. Uso y Mantenimiento

### Crear un Super Usuario
Para operaciones de administración global, se puede establecer el flag de superusuario en el contexto:
```typescript
await queryRunner.query("SET LOCAL app.is_superuser = 'true'");
```

### Añadir Nuevas Tablas
Si creas nuevas tablas que requieren aislamiento:
1.  Añade la columna `tenant_id` (FK a `users_companies`).
2.  Habilita RLS: `ALTER TABLE x ENABLE ROW LEVEL SECURITY`.
3.  Aplica la política de aislamiento estándar.

### Troubleshooting
Si las consultas devuelven **0 resultados**:
*   Verifica que el `TenantMiddleware` está detectando el tenant correctamente (logs).
*   Verifica que la cabecera `X-Tenant-ID` o el subdominio coinciden con un ID en `users_companies`.
*   Si usas `console.log` en el interceptor, confirma que `SET LOCAL` se está ejecutando.
