@echo off
setlocal enabledelayedexpansion
title SOLUCION DEFINITIVA - FORZAR CAMBIOS

echo.
echo ========================================
echo   SOLUCION DEFINITIVA - FORZAR CAMBIOS
echo ========================================
echo.

REM Detener TODOS los procesos Node.js
echo [1/6] Deteniendo todos los procesos Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo ✓ Procesos detenidos
echo.

REM Eliminar carpeta dist completa
echo [2/6] Eliminando codigo compilado...
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

REM Limpiar cache de Vite
echo [3/6] Limpiando cache de Vite...
cd client
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
    echo ✓ Cache de Vite eliminado
) else (
    echo - No hay cache de Vite
)
cd ..
echo.

REM Limpiar cache de npm
echo [4/6] Limpiando cache de npm...
cd client
call npm cache clean --force >nul 2>&1
echo ✓ Cache de npm limpiado
cd ..
echo.

REM Verificar que los cambios estan en el codigo
echo [5/6] Verificando cambios en el codigo...
cd client\src\pages
findstr /C:"$" Facturacion.jsx >nul 2>&1
if !errorlevel! equ 0 (
    echo ✓ Símbolo de dolar encontrado en el codigo
) else (
    echo ✗ ERROR: No se encuentra el simbolo de dolar
)
cd ..\..\..
echo.

REM Instrucciones finales
echo [6/6] Instrucciones para ver los cambios:
echo.
echo ════════════════════════════════════════════════
echo   PASOS CRITICOS (IMPORTANTE)
echo ════════════════════════════════════════════════
echo.
echo 1. ABRIR NAVEGADOR EN MODO INCOGNITO:
echo    - Presiona: Ctrl + Shift + N
echo    - NO uses la ventana normal
echo.
echo 2. IR A LA APLICACION:
echo    - URL: http://localhost:5173/facturacion
echo    - Si el servidor no esta corriendo, ejecuta:
echo      cd client
echo      npm run dev
echo.
echo 3. BUSCAR ESTOS CAMBIOS VISIBLES:
echo    ✓ Montos con simbolo $ (no €)
echo    ✓ Boton verde grande "Imprimir Factura"
echo    ✓ Fondo amarillo en el total en letras
echo.
echo 4. SI AUN NO VES LOS CAMBIOS:
echo    - Abre las DevTools (F12)
echo    - Ve a la pestaña "Application"
echo    - Click en "Service Workers" en el menu izquierdo
echo    - Click en "Unregister" en todos los Service Workers
echo    - Recarga la pagina (Ctrl + Shift + R)
echo.
echo ════════════════════════════════════════════════
echo.

REM Iniciar servidor
echo ¿Deseas iniciar el servidor ahora? (S/N)
set /p iniciar="> "
if /i "!iniciar!"=="S" (
    echo.
    echo Iniciando servidor de desarrollo...
    cd client
    start cmd /k "npm run dev"
    cd ..
    echo.
    echo Servidor iniciado. Espera 10 segundos y luego abre:
    echo http://localhost:5173/facturacion en modo incognito
) else (
    echo.
    echo Para iniciar el servidor manualmente:
    echo   cd client
    echo   npm run dev
)

echo.
echo ========================================
echo   LIMPIEZA COMPLETADA
echo ========================================
echo.
pause
exit /b 0

