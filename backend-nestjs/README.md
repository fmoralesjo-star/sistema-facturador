# Backend NestJS - Sistema Facturador v2.0

Backend escalable con arquitectura modular usando NestJS, PostgreSQL y Redis/BullMQ.

## 🏗️ Arquitectura

- **Framework**: NestJS (Node.js)
- **Base de Datos**: PostgreSQL con TypeORM
- **Cola de Tareas**: Redis + BullMQ
- **Lenguaje**: TypeScript

## 📋 Requisitos Previos

1. **Node.js** v18 o superior
2. **PostgreSQL** v14 o superior
3. **Redis** v6 o superior

## 🚀 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

3. Configurar PostgreSQL:
```sql
CREATE DATABASE facturador_db;
CREATE USER facturador WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE facturador_db TO facturador;
```

4. Iniciar Redis:
```bash
redis-server
```

5. Iniciar el servidor:
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 📁 Estructura del Proyecto

```
src/
├── config/              # Configuraciones (DB, Redis)
├── modules/
│   ├── facturas/       # Módulo de facturación
│   ├── productos/      # Módulo de productos
│   ├── clientes/       # Módulo de clientes
│   ├── inventario/     # Módulo de inventario
│   ├── contabilidad/   # Módulo de contabilidad
│   └── sri/           # Módulo SRI (facturación electrónica)
└── main.ts            # Punto de entrada
```

## 🔄 Cola de Tareas (SRI)

Las facturas se envían al SRI de forma asíncrona usando BullMQ:

1. La factura se crea inmediatamente
2. Se genera el XML
3. Se agrega a la cola de Redis
4. Un worker procesa el envío al SRI
5. Se actualiza el estado de la factura

## 📝 API Endpoints

- `GET /health` - Estado del servidor
- `POST /facturas` - Crear factura
- `GET /facturas` - Listar facturas
- `GET /facturas/:id` - Obtener factura
- `GET /productos` - Listar productos
- `GET /clientes` - Listar clientes

## 🔧 Migración de Datos

Para migrar datos de SQLite a PostgreSQL, usar el script de migración (a crear).

## 📚 Documentación Adicional

Ver `MIGRACION-ARQUITECTURA.md` en la raíz del proyecto para el plan completo de migración.


















