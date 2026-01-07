# 🚀 Guía: Backend en Firebase (Cloud Run)

## ✅ ¿Qué es Cloud Run?

**Google Cloud Run** es parte del ecosistema de Firebase/Google Cloud que permite ejecutar tu backend NestJS en la nube.

### Ventajas:
- ✅ **Mismo ecosistema que Firebase** - Todo en Google Cloud
- ✅ **No necesitas cambiar código** - Tu backend NestJS funciona igual
- ✅ **Escala automáticamente** - Se ajusta según la demanda
- ✅ **Gratis para empezar** - 2 millones de requests/mes gratis
- ✅ **Siempre disponible** - No se detiene si apagas tu PC

## 📋 Requisitos Previos

1. **Cuenta de Google Cloud**
   - Ve a: https://cloud.google.com
   - Crea una cuenta (gratis)
   - Crea un proyecto

2. **Google Cloud CLI instalado**
   - Descarga desde: https://cloud.google.com/sdk/docs/install
   - O ejecuta: `INSTALAR-GCLOUD.bat`

3. **Backend NestJS listo**
   - ✅ Ya tienes el backend en `backend-nestjs/`
   - ✅ Dockerfile configurado
   - ✅ Integración con Firebase

## 🚀 Despliegue Rápido

### Opción 1: Script Automático (Recomendado)

```bash
# Ejecuta el script
DESPLEGAR-BACKEND-FIREBASE.bat
```

El script:
- ✅ Verifica que tengas Google Cloud CLI
- ✅ Te autentica si es necesario
- ✅ Habilita las APIs necesarias
- ✅ Despliega tu backend en Cloud Run
- ✅ Te da la URL del backend

### Opción 2: Manual desde Terminal

```bash
# 1. Ir al directorio del backend
cd backend-nestjs

# 2. Autenticarse
gcloud auth login

# 3. Configurar proyecto
gcloud config set project TU-PROJECT-ID

# 4. Habilitar APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 5. Desplegar
gcloud run deploy sistema-facturador-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

## ⚙️ Configurar Variables de Entorno

Después del despliegue, necesitas configurar las variables de Firebase:

### Desde la Consola Web:

1. Ve a: https://console.cloud.google.com/run
2. Selecciona tu servicio: `sistema-facturador-backend`
3. Click en **"Editar y Desplegar"**
4. Ve a la pestaña **"Variables y Secretos"**
5. Agrega estas variables:

```
FIREBASE_PROJECT_ID=sistema-faacturador
FIREBASE_TYPE=service_account
FIREBASE_PRIVATE_KEY_ID=tu-private-key-id
FIREBASE_PRIVATE_KEY=tu-private-key
FIREBASE_CLIENT_EMAIL=tu-client-email
FIREBASE_CLIENT_ID=tu-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=tu-cert-url
NODE_ENV=production
ALLOWED_ORIGINS=https://sistema-faacturador-a510e.web.app,https://sistema-faacturador-a510e.firebaseapp.com
```

### Desde Terminal:

```bash
gcloud run services update sistema-facturador-backend \
  --region us-central1 \
  --set-env-vars "FIREBASE_PROJECT_ID=sistema-faacturador,NODE_ENV=production"
```

## 🔗 Actualizar Frontend

Una vez que tengas la URL del backend, actualiza el frontend:

1. **Edita `client/.env`:**
```env
VITE_API_URL=https://tu-backend-url.run.app/api
VITE_SOCKET_URL=https://tu-backend-url.run.app
```

2. **Redesplegar frontend:**
```bash
cd client
npm run build
firebase deploy --only hosting
```

## 📊 Verificar que Funciona

### 1. Endpoint de Health

Abre en tu navegador:
```
https://tu-backend-url.run.app/health
```

Deberías ver:
```json
{
  "status": "OK",
  "message": "Sistema Facturador Backend v2.0",
  "timestamp": "2024-..."
}
```

### 2. Endpoint de API

Prueba:
```
https://tu-backend-url.run.app/api
```

## 🎯 Arquitectura Final

```
┌─────────────────────────────────┐
│  FRONTEND                       │
│  Firebase Hosting               │
│  ✅ En Firebase                 │
│  https://sistema-faacturador... │
└──────────────┬──────────────────┘
               │
               │ API Calls
               ▼
┌─────────────────────────────────┐
│  BACKEND                        │
│  Google Cloud Run               │
│  ✅ En Firebase/Google Cloud    │
│  https://backend-url.run.app    │
└──────────────┬──────────────────┘
               │
               │ Firestore
               ▼
┌─────────────────────────────────┐
│  FIRESTORE                      │
│  Firebase                       │
│  ✅ En Firebase                 │
└─────────────────────────────────┘
```

## 💰 Costos

**Cloud Run (Gratis para empezar):**
- ✅ **2 millones de requests/mes** - Gratis
- ✅ **360,000 GB-segundos de CPU** - Gratis
- ✅ **1 GB de memoria** - Gratis
- ✅ Después: Muy económico (pago por uso)

**Firestore:**
- ✅ **1 GB de almacenamiento** - Gratis
- ✅ **50,000 lecturas/día** - Gratis
- ✅ **20,000 escrituras/día** - Gratis

## 🔧 Comandos Útiles

### Ver logs del backend:
```bash
gcloud run services logs read sistema-facturador-backend --region us-central1
```

### Ver información del servicio:
```bash
gcloud run services describe sistema-facturador-backend --region us-central1
```

### Actualizar el backend:
```bash
cd backend-nestjs
gcloud run deploy sistema-facturador-backend \
  --source . \
  --region us-central1
```

### Eliminar el servicio:
```bash
gcloud run services delete sistema-facturador-backend --region us-central1
```

## ✅ Resultado Final

Después de completar estos pasos:

- ✅ **Backend en Firebase/Google Cloud** - Siempre disponible
- ✅ **Firestore en Firebase** - Base de datos en la nube
- ✅ **Frontend en Firebase Hosting** - Aplicación web en la nube
- ✅ **Todo en el mismo ecosistema** - Fácil de gestionar
- ✅ **Puedes apagar tu PC** - Todo sigue funcionando

## 🆘 Solución de Problemas

### Error: "Permission denied"
- Verifica que tengas el rol "Cloud Run Admin" en tu proyecto
- Ve a: IAM & Admin → Agregar rol

### Error: "API not enabled"
- Ejecuta: `gcloud services enable run.googleapis.com`

### Error: "Build failed"
- Verifica que el Dockerfile esté correcto
- Revisa los logs: `gcloud builds log`

### El backend no se conecta a Firestore
- Verifica las variables de entorno de Firebase
- Asegúrate de que las credenciales sean correctas

## 📚 Recursos

- Cloud Run Docs: https://cloud.google.com/run/docs
- Firebase + Cloud Run: https://firebase.google.com/docs/hosting/cloud-run
- Precios: https://cloud.google.com/run/pricing


