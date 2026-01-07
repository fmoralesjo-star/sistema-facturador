@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 📦 COMPILAR BACKEND
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

REM Verificar dependencias
echo 🔍 Verificando dependencias...
if not exist "node_modules" (
    echo ⚠️  node_modules no encontrado
    echo.
    echo 📥 Instalando dependencias...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Error al instalar dependencias
        pause
        exit /b 1
    )
    echo ✅ Dependencias instaladas
    echo.
)

REM Compilar
echo ⏳ Compilando TypeScript...
echo.
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Error al compilar
    echo.
    echo 💡 Verifica:
    echo    - Que todas las dependencias estén instaladas
    echo    - Que no haya errores de TypeScript
    echo    - Revisa los mensajes de error arriba
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Compilación exitosa
echo.

REM Verificar archivos generados
echo 🔍 Verificando archivos generados...
if exist "dist\main.js" (
    echo ✅ dist/main.js encontrado
) else (
    echo ❌ Error: dist/main.js no existe
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ COMPILACIÓN COMPLETA
echo ========================================
echo.
echo 📁 Archivos compilados en: dist/
echo.
echo 💡 Para probar localmente:
echo    npm run start:prod
echo.
echo 💡 Para desplegar a Cloud Run:
echo    DESPLEGAR-BACKEND.bat
echo.
echo ========================================
echo.

pause










