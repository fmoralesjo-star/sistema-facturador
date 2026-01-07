# 🚀 Sistema Facturador

Sistema completo de facturación desplegado en Firebase/Google Cloud.

## 📍 URLs del Sistema

**Frontend (Firebase Hosting):**
```
https://sistema-faacturador-a510e.web.app
```

**Backend (Google Cloud Run):**
```
https://sistema-facturador-backend-rlydad2k3a-uc.a.run.app
```

**Endpoints:**
- Health: `https://sistema-facturador-backend-rlydad2k3a-uc.a.run.app/health`
- API: `https://sistema-facturador-backend-rlydad2k3a-uc.a.run.app/api`

## 🏗️ Arquitectura

```
Frontend (Firebase Hosting)
    ↓
Backend (Cloud Run)
    ↓
Firestore (Firebase)
```

## 📁 Estructura del Proyecto

```
SISTEMA FACTURADOR/
├── backend-nestjs/          # Backend NestJS
│   ├── src/                 # Código fuente
│   ├── Dockerfile          # Configuración Docker
│   └── package.json
├── client/                  # Frontend React
│   ├── src/                # Código fuente
│   ├── .env                # Variables de entorno
│   └── package.json
└── README.md               # Este archivo
```

## 🚀 Scripts Principales

### Desarrollo Local
- `INSTALAR-E-INICIAR.bat` - Instalación e inicio completo del sistema
- `INICIAR-BACKEND.bat` - Iniciar solo el backend

### Despliegue
- `DESPLEGAR-BACKEND-FIREBASE.bat` - Desplegar backend en Cloud Run
- `ACTUALIZAR-FRONTEND.bat` - Actualizar y desplegar frontend
- `HABILITAR-APIS-CLOUD.bat` - Habilitar APIs necesarias de Google Cloud

### Configuración
- `CONFIGURAR-FIRESTORE.bat` - Configurar Firestore

## 📚 Documentación

Toda la documentación detallada está en la carpeta `docs/`:
- `docs/README.md` - Índice de documentación
- `docs/GUIA-BACKEND-FIREBASE.md` - Guía completa de despliegue en Cloud Run
- `docs/ESTRUCTURA-PROYECTO.md` - Estructura del proyecto

## ⚙️ Configuración

### Backend

El backend está configurado para usar:
- Puerto: 8080 (Cloud Run)
- Variables de entorno: Configuradas en Cloud Run Console

### Frontend

Variables de entorno en `client/.env`:
```env
VITE_API_URL=https://sistema-facturador-backend-rlydad2k3a-uc.a.run.app/api
VITE_SOCKET_URL=https://sistema-facturador-backend-rlydad2k3a-uc.a.run.app
```

## 🔧 Desarrollo Local

### Backend

```bash
cd backend-nestjs
npm install
npm run start:dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## 📦 Despliegue

### Actualizar Backend

```bash
cd backend-nestjs
gcloud run deploy sistema-facturador-backend --source . --region us-central1 --project sistema-facturador-backend
```

### Actualizar Frontend

```bash
cd client
npm run build
firebase deploy --only hosting
```

## ✅ Estado Actual

- ✅ Backend desplegado en Cloud Run
- ✅ Frontend desplegado en Firebase Hosting
- ✅ Firestore configurado
- ✅ Todo funcionando en la nube

## 💰 Costos

**Nivel Gratuito:**
- Cloud Run: 2 millones de requests/mes
- Firestore: 1 GB almacenamiento, 50K lecturas/día
- Firebase Hosting: 10 GB almacenamiento, 360 MB/día transferencia

## 🆘 Soporte

Para problemas o preguntas, revisa la documentación en los archivos `.md` del proyecto.
