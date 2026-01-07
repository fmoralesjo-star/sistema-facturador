# 📁 Estructura del Proyecto

## 📂 Carpetas Principales

```
SISTEMA FACTURADOR/
├── backend-nestjs/          # Backend NestJS
│   ├── src/                # Código fuente
│   ├── migrations/         # Migraciones de base de datos
│   └── dist/               # Código compilado
│
├── client/                  # Frontend React
│   ├── src/                # Código fuente
│   ├── public/              # Archivos públicos
│   └── dist/                # Build de producción
│
└── servidor/                # Configuración de producción
    ├── nginx.conf           # Configuración Nginx
    └── ecosystem.config.js  # Configuración PM2
```

## 🚀 Scripts Principales

### Inicio
- `INSTALAR-E-INICIAR.bat` - Instalación completa
- `INICIAR-FIRESTORE-AHORA.bat` - Iniciar con Firestore
- `INICIAR-BACKEND.bat` - Iniciar con PostgreSQL

### Configuración
- `CONFIGURAR-CREDENCIALES-AUTOMATICO.bat` - Configurar Firebase

### Utilidades
- `CREAR-ROLES-AHORA.bat` - Crear roles
- `BUILD-PRODUCCION.bat` - Compilar para producción
- `CREAR-ICONOS-PWA.bat` - Crear iconos PWA

## 📚 Documentación

- `README.md` - Documentación principal
- `GUIA-RAPIDA-FIRESTORE.md` - Guía rápida
- `MIGRAR-A-FIRESTORE.md` - Migración completa
- `DESPLIEGUE-RAILWAY.md` - Despliegue en Railway
- `SCRIPTS-DISPONIBLES.md` - Lista de scripts

## 🔧 Configuración

### Backend
- `backend-nestjs/.env` - Variables de entorno
- `backend-nestjs/package.json` - Dependencias

### Frontend
- `client/.env` - Variables de entorno (opcional)
- `client/package.json` - Dependencias

