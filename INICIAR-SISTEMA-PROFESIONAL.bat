@echo off
chcp 65001 >nul
title SISTEMA FACTURADOR - Cargador
echo.
echo ========================================
echo 🚀 INICIANDO SISTEMA FACTURADOR
echo ========================================
echo.

echo 🔍 Verificando Node.js...
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js no está instalado. Por favor instálalo desde https://nodejs.org/
    pause
    exit
)

echo 📥 Verificando dependencias...
if not exist "backend-nestjs\node_modules" (
    echo 📦 Instalando dependencias del Backend...
    cd backend-nestjs && call npm install && cd ..
)
if not exist "client\node_modules" (
    echo 📦 Instalando dependencias del Frontend...
    cd client && call npm install && cd ..
)

echo.
echo ⚡ Iniciando servicios...
start "BACKEND" /D "backend-nestjs" cmd /c "npm run start:dev"
start "FRONTEND" /D "client" cmd /c "npm run dev"
start "MONITOR" cmd /c "MONITOR-SISTEMA.bat"

echo.
echo ✅ ¡Sistema iniciado!
echo.
echo 🌐 Accede a: http://localhost:5173
echo.
echo 💡 He iniciado un MONITOR para que si el sistema se cae, se reinicie solo.
echo 💡 No cierres las ventanas que se abrieron.
echo.
timeout /t 5 >nul
start http://localhost:5173
echo.
pause
