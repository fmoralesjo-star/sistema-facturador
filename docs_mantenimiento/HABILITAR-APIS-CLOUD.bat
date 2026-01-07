@echo off
chcp 65001 >nul
echo.
echo ========================================
echo ⚙️  HABILITAR APIs DE GOOGLE CLOUD
echo ========================================
echo.

REM Verificar proyecto configurado
for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT_ID=%%i

if "%PROJECT_ID%"=="" (
    echo ❌ No hay proyecto configurado
    echo.
    echo Ejecuta primero: CONFIGURAR-PROYECTO-CLOUD.bat
    echo O crea uno con: CREAR-PROYECTO-CLOUD.bat
    pause
    exit /b 1
)

echo ✅ Proyecto: %PROJECT_ID%
echo.

REM Verificar autenticación
gcloud auth list --filter=status:ACTIVE --format="value(account)" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ No estás autenticado
    echo.
    echo Ejecuta: gcloud auth login
    pause
    exit /b 1
)

echo 🔧 Habilitando APIs necesarias para Cloud Run...
echo.

REM Cloud Run API
echo [1/4] Habilitando Cloud Run API...
gcloud services enable run.googleapis.com --project=%PROJECT_ID%
if %ERRORLEVEL% EQU 0 (
    echo ✅ Cloud Run API habilitada
) else (
    echo ⚠️  Error al habilitar Cloud Run API
)
echo.

REM Cloud Build API
echo [2/4] Habilitando Cloud Build API...
gcloud services enable cloudbuild.googleapis.com --project=%PROJECT_ID%
if %ERRORLEVEL% EQU 0 (
    echo ✅ Cloud Build API habilitada
) else (
    echo ⚠️  Error al habilitar Cloud Build API
)
echo.

REM Artifact Registry API
echo [3/4] Habilitando Artifact Registry API...
gcloud services enable artifactregistry.googleapis.com --project=%PROJECT_ID%
if %ERRORLEVEL% EQU 0 (
    echo ✅ Artifact Registry API habilitada
) else (
    echo ⚠️  Error al habilitar Artifact Registry API
)
echo.

REM Container Registry API (opcional pero útil)
echo [4/4] Habilitando Container Registry API...
gcloud services enable containerregistry.googleapis.com --project=%PROJECT_ID%
if %ERRORLEVEL% EQU 0 (
    echo ✅ Container Registry API habilitada
) else (
    echo ⚠️  Error al habilitar Container Registry API (opcional)
)
echo.

echo ========================================
echo ✅ APIs HABILITADAS
echo ========================================
echo.
echo 📝 Próximo paso: Ejecuta DESPLEGAR-BACKEND-FIREBASE.bat
echo.
pause












