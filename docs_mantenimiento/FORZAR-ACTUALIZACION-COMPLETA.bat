@echo off
setlocal enabledelayedexpansion
title FORZAR ACTUALIZACION COMPLETA

echo.
echo ========================================
echo   FORZANDO ACTUALIZACION COMPLETA
echo ========================================
echo.

REM Detener todos los procesos de Node.js
echo [1/5] Deteniendo procesos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo ✓ Procesos detenidos
echo.

REM Limpiar cache de Vite
echo [2/5] Limpiando cache de Vite...
cd client
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
    echo ✓ Cache de Vite eliminado
) else (
    echo - No hay cache de Vite
)
cd ..
echo.

REM Limpiar dist si existe
echo [3/5] Limpiando codigo compilado...
if exist client\dist (
    rmdir /s /q client\dist
    echo ✓ Carpeta dist eliminada
) else (
    echo - No hay carpeta dist
)
if exist backend-nestjs\dist (
    rmdir /s /q backend-nestjs\dist
    echo ✓ Dist del backend eliminado
)
echo.

REM Limpiar cache del navegador (instrucciones)
echo [4/5] Instrucciones para limpiar cache del navegador:
echo.
echo CHROME/EDGE:
echo 1. Presiona Ctrl + Shift + Delete
echo 2. Selecciona "Imagenes y archivos en cache"
echo 3. Periodo: "Ultima hora" o "Todo el tiempo"
echo 4. Click en "Borrar datos"
echo.
echo O en modo incognito (mas rapido):
echo - Presiona Ctrl + Shift + N
echo - Ve a: http://localhost:5173
echo.
echo.

REM Iniciar servidor
echo [5/5] Iniciando servidor de desarrollo...
echo.
echo IMPORTANTE:
echo - Espera a que aparezca "Local:   http://localhost:5173"
echo - Luego abre en modo incognito: Ctrl + Shift + N
echo - Ve a: http://localhost:5173/facturacion
echo - El boton deberia decir "IMPRIMIR FACTURA (NUEVO)"
echo.
cd client
start cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo   LISTO
echo ========================================
echo.
pause
exit /b 0

