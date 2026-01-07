@echo off
chcp 65001 >nul
title SISTEMA FACTURADOR - Monitor de Sistema
echo.
echo ========================================
echo 🛡️  SISTEMA FACTURADOR - AUTO-RECUPERACIÓN
echo ========================================
echo.

:INICIO
echo [%DATE% %TIME%] 🔍 Verificando estado del sistema...

REM Verificar Backend (Puerto 3001)
netstat -ano | findstr :3001 | findstr LISTENING >nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Backend CAÍDO. Intentando reiniciar...
    
    REM Matar procesos huérfanos si existen (opcional pero recomendado)
    REM taskkill /f /im node.exe /fi "WINDOWTITLE eq BACKEND" >nul 2>&1
    
    start "BACKEND" /D "backend-nestjs" cmd /c "node scripts\ensure-certs.js && npm run start:dev"
    echo ⏳ Esperando a que el Backend inicie (30s)...
    timeout /t 30 >nul
) else (
    echo ✅ Backend operando correctamente en puerto 3001.
)

REM Verificar Frontend (Puerto 5173)
netstat -ano | findstr :5173 | findstr LISTENING >nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Frontend CAÍDO. Reiniciando...
    start "FRONTEND" /D "client" cmd /c "npm run dev"
    timeout /t 10 >nul
) else (
    echo ✅ Frontend operando correctamente en puerto 5173.
)

echo.
echo 🕒 Próxima verificación en 60 segundos...
echo 💡 Mantén esta ventana abierta para asegurar la estabilidad del sistema.
echo.

timeout /t 60 >nul
goto INICIO
