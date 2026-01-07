@echo off
setlocal enabledelayedexpansion
title Limpiar Cache y Codigo Compilado
color 0B
cls

echo ========================================
echo   LIMPIEZA DE CACHE Y CODIGO COMPILADO
echo ========================================
echo.
echo Este script eliminara:
echo   - Codigo compilado (dist/)
echo   - Cache de Vite (node_modules/.vite)
echo   - Cache del backend (backend-nestjs/dist)
echo.

pause

cd /d "%~dp0"

echo.
echo [1/3] Limpiando frontend (client)...
cd client
if exist "dist" (
    echo    Eliminando dist/...
    rmdir /s /q "dist"
    echo    ✓ dist/ eliminado
) else (
    echo    ✓ No hay dist/ que eliminar
)

if exist "node_modules\.vite" (
    echo    Eliminando cache de Vite...
    rmdir /s /q "node_modules\.vite"
    echo    ✓ Cache de Vite eliminado
) else (
    echo    ✓ No hay cache de Vite
)
cd ..

echo.
echo [2/3] Limpiando backend (backend-nestjs)...
cd backend-nestjs
if exist "dist" (
    echo    Eliminando dist/...
    rmdir /s /q "dist"
    echo    ✓ dist/ eliminado
) else (
    echo    ✓ No hay dist/ que eliminar
)
cd ..

echo.
echo [3/3] Limpieza completada!
echo.
echo ========================================
echo   PRÓXIMOS PASOS
echo ========================================
echo.
echo Para desarrollo:
echo   1. cd client
echo   2. npm run dev
echo   3. En el navegador: Ctrl + Shift + R
echo.
echo Para produccion:
echo   1. cd client
echo   2. npm run build
echo   3. firebase deploy --only hosting
echo.
pause


