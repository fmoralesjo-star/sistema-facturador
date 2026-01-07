@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🚀 DESPLEGAR BACKEND A CLOUD RUN
echo ========================================
echo.

REM Cambiar al directorio del backend
cd backend-nestjs
if %ERRORLEVEL% NEQ 0 (
    echo ❌ No se encontró la carpeta backend-nestjs
    pause
    exit /b 1
)

echo 📂 Directorio: %CD%
echo.

REM Paso 1: Compilar el backend
echo ========================================
echo 📦 PASO 1: COMPILANDO BACKEND
echo ========================================
echo.
echo ⏳ Compilando TypeScript...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Error al compilar el backend
    echo.
    echo 💡 Verifica que:
    echo    - Todas las dependencias estén instaladas (npm install)
    echo    - No haya errores de TypeScript
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Compilación exitosa
echo.
echo 🔄 Verificando archivos compilados...

REM Verificar que dist/main.js existe
if not exist "dist\main.js" (
    echo.
    echo ❌ Error: dist/main.js no existe después de la compilación
    echo.
    echo 💡 Verifica los mensajes de compilación arriba
    echo.
    echo 📂 Directorio actual: %CD%
    echo.
    echo ⚠️  El script se cerrará ahora.
    echo.
    pause
    exit /b 1
)

echo ✅ Archivo dist/main.js encontrado
echo.
echo ⏭️  Continuando con el despliegue...
echo.
echo 📍 Presiona cualquier tecla para continuar con la verificación de Google Cloud CLI...
pause >nul
echo.

REM Paso 2: Verificar Google Cloud CLI
echo ========================================
echo 🔧 PASO 2: VERIFICANDO GOOGLE CLOUD CLI
echo ========================================
echo.

echo 🔍 Buscando Google Cloud CLI...
where gcloud >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Google Cloud CLI no está instalado
    echo.
    echo 📥 Descarga e instala desde:
    echo    https://cloud.google.com/sdk/docs/install
    echo.
    echo ⚠️  El script se cerrará ahora.
    echo.
    pause
    exit /b 1
)

echo ✅ Google Cloud CLI encontrado
echo.
echo 📍 Presiona cualquier tecla para continuar con la verificación de autenticación...
pause >nul
echo.

REM Verificar autenticación
echo 🔐 Verificando autenticación...
gcloud auth list --filter=status:ACTIVE --format="value(account)" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  No estás autenticado en Google Cloud
    echo.
    echo 🔑 Iniciando autenticación...
    gcloud auth login
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Error en la autenticación
        pause
        exit /b 1
    )
)

for /f "tokens=*" %%i in ('gcloud auth list --filter=status:ACTIVE --format="value(account)" 2^>nul') do set ACTIVE_ACCOUNT=%%i
echo ✅ Autenticado como: %ACTIVE_ACCOUNT%
echo.

REM Obtener proyecto actual
echo 📋 Obteniendo proyecto actual...
for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT_ID=%%i

if "%PROJECT_ID%"=="" (
    echo.
    echo ⚠️  No hay proyecto configurado
    echo.
    echo 📝 Listando proyectos disponibles...
    gcloud projects list
    echo.
    set /p PROJECT_ID="Ingresa el ID del proyecto: "
    if "%PROJECT_ID%"=="" (
        echo ❌ No se especificó un proyecto
        pause
        exit /b 1
    )
    gcloud config set project %PROJECT_ID%
)

echo ✅ Proyecto: %PROJECT_ID%
echo.

REM Habilitar APIs necesarias
echo 🔧 Habilitando APIs necesarias...
gcloud services enable run.googleapis.com --quiet
gcloud services enable cloudbuild.googleapis.com --quiet
gcloud services enable artifactregistry.googleapis.com --quiet
echo ✅ APIs habilitadas
echo.

REM Paso 3: Desplegar a Cloud Run
echo ========================================
echo 🚀 PASO 3: DESPLEGANDO A CLOUD RUN
echo ========================================
echo.

REM Usar región por defecto o la del proyecto
set REGION=us-central1
set SERVICE_NAME=sistema-facturador-backend

echo 📍 Región: %REGION%
echo 📦 Servicio: %SERVICE_NAME%
echo.
echo ⏳ Desplegando... (esto puede tardar varios minutos)
echo.
echo 💡 NOTA: Este proceso puede tardar 5-10 minutos
echo    Por favor, no cierres esta ventana
echo.

REM Desplegar en Cloud Run
gcloud run deploy %SERVICE_NAME% ^
    --source . ^
    --platform managed ^
    --region %REGION% ^
    --allow-unauthenticated ^
    --port 8080 ^
    --memory 512Mi ^
    --cpu 1 ^
    --timeout 300 ^
    --max-instances 10 ^
    --min-instances 0

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Error al desplegar
    echo.
    echo 💡 Verifica:
    echo    - Que tengas permisos en el proyecto
    echo    - Que las APIs estén habilitadas
    echo    - Que el Dockerfile sea correcto
    echo    - Que la compilación haya sido exitosa
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ ¡Despliegue exitoso!
echo.

REM Obtener URL del servicio
echo 📍 Obteniendo URL del servicio...
for /f "tokens=*" %%i in ('gcloud run services describe %SERVICE_NAME% --platform managed --region %REGION% --format="value(status.url)"') do set SERVICE_URL=%%i

echo.
echo ========================================
echo ✅ BACKEND DESPLEGADO EXITOSAMENTE
echo ========================================
echo.
echo 🌐 URL del Backend:
echo    %SERVICE_URL%
echo.
echo 📡 Endpoint de API:
echo    %SERVICE_URL%/api
echo.
echo ❤️  Endpoint de Health:
echo    %SERVICE_URL%/health
echo.
echo 📋 Endpoint de Roles:
echo    %SERVICE_URL%/api/usuarios/roles
echo.
echo ========================================
echo.

REM Guardar URL en archivo
cd ..
echo %SERVICE_URL% > URL-BACKEND-CLOUD-RUN.txt
echo ✅ URL guardada en: URL-BACKEND-CLOUD-RUN.txt
echo.

REM Probar el endpoint de health
echo 🔍 Probando endpoint de health...
curl -s "%SERVICE_URL%/health" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend respondiendo correctamente
) else (
    echo ⚠️  No se pudo verificar el endpoint (puede tardar unos segundos en estar disponible)
)
echo.

echo 📝 PRÓXIMOS PASOS:
echo.
echo 1. Verificar que el backend esté funcionando:
echo    Visita: %SERVICE_URL%/health
echo.
echo 2. Probar el endpoint de roles:
echo    %SERVICE_URL%/api/usuarios/roles
echo    (Requiere autenticación)
echo.
echo 3. Si el frontend no se actualiza automáticamente:
echo    - Verifica que la URL en client/src/config/api.js sea correcta
echo    - O actualiza la variable de entorno VITE_API_URL
echo.
echo ========================================
echo.
echo ⚠️  IMPORTANTE: Mantén esta ventana abierta durante todo el proceso
echo    Si se cierra, el despliegue se interrumpirá
echo.
pause

