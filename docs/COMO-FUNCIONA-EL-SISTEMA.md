# 🔍 Cómo Funciona el Sistema

## 📊 Arquitectura del Sistema

Tu sistema tiene **2 partes** que trabajan juntas:

### 1️⃣ **FRONTEND** (Interfaz - Lo que ves)
- **¿Qué es?** La aplicación web que ves en el navegador
- **¿Dónde está?** Desplegada en Firebase Hosting
- **URL:** https://sistema-faacturador-a510e.web.app
- **Función:** Muestra las pantallas, formularios, botones

### 2️⃣ **BACKEND** (Servidor - Lógica de negocio)
- **¿Qué es?** El servidor que procesa los datos
- **¿Dónde está?** Debe correr en tu computadora (localhost)
- **URL:** http://localhost:3001
- **Función:** Guarda datos, procesa facturas, maneja la base de datos

## 🔄 Cómo Trabajan Juntos

```
┌─────────────────────────────────────┐
│  FRONTEND (Navegador)               │
│  https://sistema-faacturador...      │
│  - Muestra pantallas                │
│  - Formularios                      │
│  - Botones                           │
└──────────────┬──────────────────────┘
               │
               │ Pide datos
               │ Envía información
               ▼
┌─────────────────────────────────────┐
│  BACKEND (Tu Computadora)            │
│  http://localhost:3001               │
│  - Procesa datos                     │
│  - Guarda en Firestore               │
│  - Responde al frontend              │
└─────────────────────────────────────┘
```

## 🎯 Por Qué Necesitas Ambos

### Frontend (URL Pública)
- ✅ **Ya está desplegado** - No necesitas hacer nada
- ✅ **Accesible desde cualquier lugar** - Internet
- ✅ **Siempre disponible** - 24/7

### Backend (Localhost)
- ⚠️ **Debes iniciarlo** - Ejecutar `INICIAR-FIRESTORE-AHORA.bat`
- ⚠️ **Solo funciona cuando está corriendo** - En tu computadora
- ⚠️ **Solo accesible desde tu red local** - Por ahora

## 📋 Pasos para Usar el Sistema

### Opción 1: Usar URL Pública (Recomendado)

1. **Inicia el Backend:**
   ```bash
   INICIAR-FIRESTORE-AHORA.bat
   ```
   - Esto inicia el servidor en tu computadora
   - Debe estar corriendo para que funcione

2. **Abre el Frontend:**
   - Ve a: https://sistema-faacturador-a510e.web.app
   - El frontend se conectará al backend en tu computadora

3. **Usa el Sistema:**
   - Crea productos, facturas, clientes
   - Todo se guarda en Firestore

### Opción 2: Todo Local (Desarrollo)

1. **Inicia el Backend:**
   ```bash
   INICIAR-FIRESTORE-AHORA.bat
   ```

2. **Inicia el Frontend:**
   ```bash
   cd client
   npm run dev
   ```

3. **Abre en el navegador:**
   - Ve a: http://localhost:5173

## ❓ Preguntas Frecuentes

### ¿Por qué dos URLs diferentes?

- **Frontend (URL pública):** Ya está desplegado, siempre disponible
- **Backend (localhost):** Debe correr en tu computadora para procesar datos

### ¿Puedo usar solo la URL pública?

**NO** - El frontend necesita el backend para funcionar. El backend debe estar corriendo en tu computadora.

### ¿El backend debe estar siempre corriendo?

**SÍ** - Mientras uses el sistema, el backend debe estar activo. Si lo cierras, el frontend no podrá guardar datos.

### ¿Puedo acceder desde otro dispositivo?

**SÍ** - Puedes acceder al frontend desde cualquier dispositivo usando la URL pública, PERO el backend debe estar corriendo en tu computadora.

## 🎯 Resumen Simple

1. **Frontend** = La aplicación web (URL pública) ✅ Ya está lista
2. **Backend** = El servidor (localhost) ⚠️ Debes iniciarlo
3. **Ambos trabajan juntos** = Sistema completo funcionando

## 🚀 Inicio Rápido

```bash
# 1. Inicia el backend
INICIAR-FIRESTORE-AHORA.bat

# 2. Abre en el navegador
https://sistema-faacturador-a510e.web.app
```

¡Listo! El sistema funcionará.

