# Plan de Integración: Patoshub (Móvil) + Sistema Facturador (Backend)

Este documento describe la hoja de ruta para integrar la aplicación móvil "Patoshub" con el backend existente del Sistema Facturador.

## Estado Actual
- **Patoshub**: App Android nativa (Jetpack Compose). Actualmente funciona con base de datos local (Room) y tiene un cliente HTTP (Retrofit) listo para conectar.
- **Sistema Facturador**: Backend NestJS + PostgreSQL alojado en Render.

## Objetivo
Conectar la app móvil al backend para que compartan la misma información (Usuarios, Productos, Pedidos/Facturas).

## Pasos para la Integración (Futuro)

### Fase 1: Autenticación (El Puente)
1. **Endpoint de Login**: Crear o adaptar en el Backend (`src/modules/auth` o `usuarios`) la ruta `POST /api/auth/login`.
   - Debe recibir: `username`, `password`.
   - Debe devolver: `token` (JWT), datos del usuario y rol.
2. **Roles**: Mapear los roles de Patoshub (Admin, Cliente, Dueño) con los roles existentes en el Sistema Facturador (`roles` en BD).

### Fase 2: Sincronización de Productos
1. **API Pública de Productos**: Asegurar que el backend tenga un endpoint `GET /api/productos` optimizado para móvil (paginación, búsqueda ligera).
2. **Adaptador en Android**: Ajustar los modelos de datos en Android para que coincidan con la estructura JSON que devuelve NestJS.

### Fase 3: Gestión de Pedidos/Ventas
1. **Crear Pedido**: Implementar `POST /api/pedidos` en el backend para recibir ventas desde el celular.
2. **Flujo de Facturación**: Decidir si un pedido móvil se convierte automáticamente en Factura o si queda como "Proforma/Pedido" para aprobación.

### Configuración Técnica Requerida
- En Android (`RetrofitClient.kt`): Apuntar `BASE_URL` a `https://sistema-facturador-ln63.onrender.com/api/`.

---
*Este archivo sirve como punto de partida para retomar el trabajo.*
