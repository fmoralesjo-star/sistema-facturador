# 🚀 Guía de Despliegue en Render.com

Esta guía te llevará paso a paso por el proceso de desplegar tu Sistema Facturador en Render con PostgreSQL.

---

## 📋 Requisitos Previos

- [ ] Cuenta en [Render.com](https://render.com) (gratis)
- [ ] Repositorio Git (GitHub, GitLab o Bitbucket) con tu código
- [ ] Variables de entorno configuradas localmente funcionando

---

## 🎯 Paso 1: Preparar el Repositorio

### 1.1 Subir cambios a Git

```powershell
# Desde la raíz del proyecto
cd "c:\Users\pc\SISTEMA FACTURADOR"

# Verificar archivos modificados
git status

# Agregar todos los cambios
git add .

# Commit
git commit -m "feat: Configuración para despliegue en Render"

# Push al repositorio remoto
git push origin main
```

> **Nota**: Si no tienes un repositorio remoto, créalo en GitHub/GitLab primero.

---

## 🗄️ Paso 2: Crear Base de Datos PostgreSQL

### 2.1 Desde el Dashboard de Render

1. Ir a [dashboard.render.com](https://dashboard.render.com)
2. Click en **"New +"** → **"PostgreSQL"**
3. Configurar:
   - **Name**: `facturador-db`
   - **Database**: `facturador_db`
   - **User**: `facturador`
   - **Region**: `Oregon (US West)` o el más cercano
   - **Plan**: `Starter` (Gratis - 95 MB)
4. Click en **"Create Database"**
5. ⏳ Esperar ~2 minutos a que se cree

### 2.2 Obtener credenciales

Una vez creada, en la página de la base de datos:
- Copiar **Internal Database URL** (comienza con `postgresql://`)
- Guardarla temporalmente, la necesitaremos

---

## 🔧 Paso 3: Desplegar Backend (API)

### 3.1 Crear Web Service

1. En Dashboard → **"New +"** → **"Web Service"**
2. Conectar tu repositorio Git
3. Configurar:
   - **Name**: `backend-facturador`
   - **Region**: Mismo que la base de datos
   - **Branch**: `main`
   - **Root Directory**: `backend-nestjs`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: `Starter` (Gratis)

### 3.2 Configurar Variables de Entorno

En la sección **Environment**:

```env
# Database (usar Internal Database URL de Paso 2.2)
DATABASE_URL=postgresql://facturador:xxxxx@dpg-xxxxx-a.oregon-postgres.render.com/facturador_db

# Application
NODE_ENV=production
PORT=3001

# Security - GENERAR NUEVA CLAVE SEGURA
JWT_SECRET=<GENERAR-CLAVE-ALEATORIA-AQUI>

# CORS - PENDIENTE (agregar después de desplegar frontend)
ALLOWED_ORIGINS=https://sistema-facturador.onrender.com

# SRI
SRI_AMBIENTE=PRUEBAS
SRI_TIMEOUT=30000

# File Upload
UPLOAD_PATH=./uploads
```

> **Generar JWT_SECRET seguro**:
> ```powershell
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 3.3 Configurar Health Check

- **Health Check Path**: `/health`
- Render verificará este endpoint cada minuto

### 3.4 Desplegar

1. Click en **"Create Web Service"**
2. ⏳ Esperar ~5-10 minutos al primer despliegue
3. Verificar logs en tiempo real
4. Una vez completado, copiar la **URL del servicio** (ej: `https://backend-facturador.onrender.com`)

---

## 🎨 Paso 4: Desplegar Frontend

### 4.1 Crear Static Site

1. En Dashboard → **"New +"** → **"Static Site"**
2. Conectar el mismo repositorio
3. Configurar:
   - **Name**: `sistema-facturador`
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### 4.2 Configurar Variables de Entorno

```env
# API URL del backend (usar URL del Paso 3.4)
VITE_API_URL=https://backend-facturador.onrender.com/api
```

### 4.3 Desplegar

1. Click en **"Create Static Site"**
2. ⏳ Esperar ~3-5 minutos
3. Copiar la **URL del sitio** (ej: `https://sistema-facturador.onrender.com`)

---

## 🔄 Paso 5: Actualizar CORS en Backend

Ahora que tenemos la URL del frontend, actualizar CORS:

1. Ir al servicio **backend-facturador** en Render
2. **Environment** → Editar `ALLOWED_ORIGINS`
3. Actualizar con la URL del frontend:
   ```
   https://sistema-facturador.onrender.com
   ```
4. Click en **"Save Changes"**
5. ✅ Render redesplegará automáticamente (~2 min)

---

## 🧪 Paso 6: Verificación y Pruebas

### 6.1 Verificar Backend

1. Abrir: `https://backend-facturador.onrender.com/health`
2. Debe responder: `{"status":"OK","message":"Sistema Facturador Backend v2.0"}`

### 6.2 Verificar Frontend

1. Abrir: `https://sistema-facturador.onrender.com`
2. La aplicación debe cargar correctamente
3. Abrir consola del navegador (F12), verificar:
   - `🔧 Using VITE_API_URL from environment: https://backend-facturador.onrender.com/api`
   - Sin errores de CORS

### 6.3 Prueba de Conectividad

1. En el frontend, intentar **crear un usuario** o **hacer login**
2. Verificar en Network (F12 → Network):
   - Las peticiones van a `https://backend-facturador.onrender.com/api/...`
   - Status 200/201 (éxito) o errores específicos de la aplicación (no CORS)

---

## 📊 Paso 7: Configuración Inicial de la Aplicación

### 7.1 Crear Usuario Administrador

1. Registrarse en la aplicación con credenciales de admin
2. Verificar que se guarde en la base de datos

### 7.2 Configurar Empresa

1. Ir a **Configuración** → **Empresa**
2. Llenar datos de la empresa:
   - RUC
   - Razón Social
   - Nombre Comercial
   - Dirección
   - Teléfonos

### 7.3 Configurar Punto de Venta

1. Crear establecimiento (ejemplo: `001`)
2. Crear punto de emisión (ejemplo: `001`)

### 7.4 Subir Certificado SRI (.p12)

1. Ir a **Configuración** → **SRI**
2. Subir archivo `.p12`
3. Ingresar contraseña del certificado
4. Verificar que se cargue correctamente

---

## 🔍 Paso 8: Monitoreo

### 8.1 Logs en Render

- **Backend**: Dashboard → backend-facturador → **Logs**
- **Frontend**: Dashboard → sistema-facturador → **Logs**
- **Database**: Dashboard → facturador-db → **Logs**

### 8.2 Métricas

Render provee métricas gratuitas:
- CPU Usage
- Memory Usage
- Request Count
- Response Times

---

## 🆘 Troubleshooting

### ❌ Error: "No permitido por CORS"

**Solución**:
1. Verificar que `ALLOWED_ORIGINS` en backend incluya la URL exacta del frontend
2. Verificar que la URL no tenga `/` al final
3. Redesplegar backend después de cambiar

### ❌ Error: "Cannot connect to database"

**Solución**:
1. Verificar que `DATABASE_URL` esté configurada correctamente
2. Usar **Internal Database URL**, no External
3. Verificar que backend y database estén en la misma región

### ❌ Error 404 en rutas del frontend

**Solución**:
1. Verificar que el Static Site tenga configurado:
   - **Publish Directory**: `dist`
   - **Rewrite Rules**: Todas las rutas → `/index.html`

### ❌ Backend se suspende (plan gratuito)

**Comportamiento normal**: El plan gratuito suspende después de 15 min de inactividad.
- Primera petición después de suspensión: ~30 segundos
- Soluciones:
  - Upgrade a plan Standard ($7/mes, siempre activo)
  - Usar servicio de "keep-alive" externo

### ❌ Error: "Module not found" en build

**Solución**:
1. Verificar que `package.json` y `package-lock.json` estén en el repo
2. Limpiar caché de Render: Settings → **Clear build cache & deploy**

---

## 📦 Backups

### Backup Manual de Base de Datos

```bash
# Desde terminal local con PostgreSQL instalado
pg_dump -h dpg-xxxxx-a.oregon-postgres.render.com \
        -U facturador \
        -d facturador_db \
        > backup_$(date +%Y%m%d).sql
```

### Backup Automático (Render)

- Plan **Starter** (gratis): ❌ No incluye backups automáticos
- Plan **Standard**: ✅ Backups diarios por 7 días
- Plan **Pro**: ✅ Backups diarios por 30 días

---

## 💰 Costos

### Plan Gratuito (Starter)

| Servicio | Límites | Restricciones |
|----------|---------|---------------|
| PostgreSQL | 95 MB | Eliminada tras 90 días inactividad |
| Backend | 512 MB RAM | Suspende tras 15 min inactividad |
| Frontend | 100 GB bandwidth | - |

### Upgrade Recomendado

Para **producción real**:
- **Database**: Standard ($7/mes) - 256 MB, backups, siempre activo
- **Backend**: Standard ($7/mes) - 512 MB, siempre activo, SSL
- **Frontend**: Gratis es suficiente

**Total**: ~$14/mes + impuestos

---

## 🔄 Actualizaciones

### Despliegue Automático

Render redespliegua automáticamente cuando haces `git push`:

```powershell
# Hacer cambios en el código
# ...

# Commit y push
git add .
git commit -m "feat: Nueva funcionalidad"
git push origin main

# Render detecta el push y redespliegua automáticamente
```

### Despliegue Manual

1. Ir al servicio en Dashboard
2. Click en **"Manual Deploy"** → **"Deploy latest commit"**

---

## 📚 Recursos Adicionales

- [Documentación de Render](https://render.com/docs)
- [Render Status](https://status.render.com/) - Estado de servicios
- [Render Community](https://community.render.com/) - Foro de ayuda

---

## ✅ Checklist Final

- [ ] Base de datos PostgreSQL creada y funcionando
- [ ] Backend desplegado y health check OK
- [ ] Frontend desplegado y cargando
- [ ] CORS configurado correctamente
- [ ] Variables de entorno configuradas
- [ ] Usuario administrador creado
- [ ] Datos de empresa configurados
- [ ] Certificado SRI subido (si aplica)
- [ ] Prueba de facturación exitosa

---

**¡Felicidades! 🎉 Tu Sistema Facturador está desplegado en la nube.**
