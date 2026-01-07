# 🔥 Configurar Firestore en el Backend

Este documento explica cómo configurar Firestore para que el backend pueda guardar datos.

## 📋 Requisitos Previos

1. Tienes un proyecto de Firebase configurado
2. El proyecto ID es: `sistema-faacturador` (o el que uses en el frontend)

## 🔑 Paso 1: Obtener las Credenciales de Firebase Admin SDK

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **sistema-faacturador**
3. Haz clic en el ícono de ⚙️ (Configuración del proyecto) → **Configuración del proyecto**
4. Ve a la pestaña **Cuentas de servicio**
5. Haz clic en **Generar nueva clave privada**
6. Se descargará un archivo JSON (ejemplo: `sistema-faacturador-firebase-adminsdk-xxxxx.json`)

## 📝 Paso 2: Convertir el JSON a Variables de Entorno

El archivo JSON tiene esta estructura:
```json
{
  "type": "service_account",
  "project_id": "sistema-faacturador",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...@...iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

## 🚀 Paso 3: Configurar Variables en Cloud Run

Ejecuta el siguiente comando reemplazando los valores con los de tu archivo JSON:

```bash
gcloud run services update sistema-facturador-backend \
  --region us-central1 \
  --update-env-vars \
    FIREBASE_TYPE="service_account",\
    FIREBASE_PROJECT_ID="sistema-faacturador",\
    FIREBASE_PRIVATE_KEY_ID="TU_PRIVATE_KEY_ID",\
    FIREBASE_PRIVATE_KEY="TU_PRIVATE_KEY_COMPLETA",\
    FIREBASE_CLIENT_EMAIL="TU_CLIENT_EMAIL",\
    FIREBASE_CLIENT_ID="TU_CLIENT_ID",\
    FIREBASE_CLIENT_X509_CERT_URL="TU_CLIENT_X509_CERT_URL",\
    USE_FIRESTORE="true"
```

**⚠️ IMPORTANTE:** 
- Reemplaza `TU_PRIVATE_KEY_ID`, `TU_PRIVATE_KEY_COMPLETA`, etc. con los valores reales del JSON
- La `private_key` debe incluir los caracteres `\n` literalmente (no como saltos de línea)
- Usa el script `CONFIGURAR-FIRESTORE.bat` para facilitar este proceso

## ✅ Paso 4: Verificar la Configuración

1. El backend se reiniciará automáticamente
2. Revisa los logs:
   ```bash
   gcloud run services logs read sistema-facturador-backend --region us-central1 --limit 20
   ```
3. Deberías ver: `✅ Firebase Admin inicializado correctamente`

## 🔍 Solución de Problemas

### Error: "Firestore no está disponible"
- Verifica que todas las variables de entorno estén configuradas
- Revisa que `USE_FIRESTORE="true"`
- Asegúrate de que las credenciales sean correctas

### Error: "Invalid credentials"
- Verifica que la `private_key` tenga los saltos de línea correctos (`\n`)
- Asegúrate de que no haya espacios extras en las variables


