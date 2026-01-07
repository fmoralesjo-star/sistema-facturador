# Guía de Instalación - Backend NestJS

## Paso 1: Instalar Dependencias del Sistema

### Windows
```powershell
# Instalar PostgreSQL
# Descargar desde: https://www.postgresql.org/download/windows/

# Instalar Redis
# Descargar desde: https://github.com/microsoftarchive/redis/releases
# O usar WSL2 con Ubuntu
```

### Linux/Mac
```bash
# PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Redis
sudo apt-get install redis-server
# o en Mac: brew install redis
```

## Paso 2: Configurar PostgreSQL

```sql
-- Conectar como postgres
sudo -u postgres psql

-- Crear base de datos y usuario
CREATE DATABASE facturador_db;
CREATE USER facturador WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE facturador_db TO facturador;
\q
```

## Paso 3: Configurar Redis

```bash
# Iniciar Redis
redis-server

# Verificar que está corriendo
redis-cli ping
# Debe responder: PONG
```

## Paso 4: Configurar el Proyecto

```bash
cd backend-nestjs

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus credenciales
nano .env  # o usar tu editor preferido
```

## Paso 5: Iniciar el Servidor

```bash
# Desarrollo (con hot-reload)
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## Verificar Instalación

1. El servidor debería iniciar en `http://localhost:3001`
2. Verificar endpoint: `GET http://localhost:3001/health`
3. Debe responder: `{ "status": "OK", ... }`

## Troubleshooting

### Error de conexión a PostgreSQL
- Verificar que PostgreSQL esté corriendo: `sudo systemctl status postgresql`
- Verificar credenciales en `.env`
- Verificar que la base de datos existe

### Error de conexión a Redis
- Verificar que Redis esté corriendo: `redis-cli ping`
- Verificar puerto en `.env` (default: 6379)

### Error de TypeORM
- Verificar que `DATABASE_SYNC=false` en producción
- Usar migraciones en producción: `npm run migration:run`


















