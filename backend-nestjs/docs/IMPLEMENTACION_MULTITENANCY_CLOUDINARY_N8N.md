# Plan de Implementación: Multi-tenancy, Cloudinary y n8n

Este documento detalla los pasos para transformar el Sistema Facturador en una plataforma Multi-tenant con gestión de archivos en la nube y automatización.

## 1. Multi-tenancy (Aislamiento de Datos)

El objetivo es permitir que múltiples empresas operen en la misma instancia sin ver los datos de las otras.

### Estrategia: Discriminador de Columna (`empresa_id`)
Se añadirá una columna `empresa_id` a todas las tablas críticas.

### Entidades a Modificar
- **Producto**: Añadir `empresa_id`.
- **Cliente**: Añadir `empresa_id`.
- **Factura**: Ya tiene `empresa_id` (Verificar consistencia).
- **Usuario**: Añadir `empresa_id` (Vincular usuario a una empresa).
- **Inventario/Movimientos**: Derivado del producto o explícito.
- **Configuración**: Diferenciar por empresa.

### Cambios en Código
1.  Crear `TenantAwareEntity` (Clase base o Mixin).
2.  Actualizar entidades `Producto`, `Cliente`, `Usuario`.
3.  Actualizar lógica de Servicios para filtrar siempre por `empresa_id` del usuario autenticado.

## 2. Gestión de Archivos (Cloudinary)

Centralizar archivos (imágenes de productos, logos, firmas p12) en Cloudinary para evitar depender del sistema de archivos local (crucial para despliegues en la nube como Render/Google Cloud).

### Cambios en Código
1.  Instalar dependencias: `npm install cloudinary streamifier`.
2.  Crear `CloudinaryProvider` y `CloudinaryService` en `MediaModule`.
3.  Reemplazar `multer.diskStorage` por subida directa a Cloudinary.

## 3. Automatización (n8n)

Permitir que el sistema notifique a n8n cuando ocurran eventos importantes (ej: Nueva Factura, Stock Bajo).

### Estrategia: Webhooks
El backend enviará peticiones HTTP (POST) a flujos de trabajo de n8n.

### Cambios en Código
1.  Crear módulo `IntegracionModule` (o usar uno existente).
2.  Definir eventos: `factura.creada`, `stock.bajo`.
3.  Implementar servicio que envíe datos al Webhook URL configurado para la empresa.

---

## Instrucciones de Instalación
Ejecutar en `backend-nestjs`:
```bash
npm install cloudinary streamifier
npm install --save-dev @types/streamifier
```
