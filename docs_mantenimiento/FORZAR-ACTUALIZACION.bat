@echo off
echo ========================================
echo   FORZAR ACTUALIZACION DE CAMBIOS
echo ========================================
echo.
echo Este script ayudara a ver los cambios recientes
echo.
pause

cd /d "%~dp0"

echo [1/4] Limpiando cache de Vite...
cd client
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo    Cache de Vite eliminado
) else (
    echo    No hay cache de Vite
)

if exist "dist" (
    echo    Eliminando carpeta dist...
    rmdir /s /q "dist"
)

cd ..

echo.
echo [2/4] Limpiando node_modules del root (si existe)...
if exist "node_modules" (
    echo    Advertencia: node_modules en root encontrado
)

echo.
echo [3/4] Verificando cambios en archivos...
echo.
echo Cambios verificados en:
echo    - client/src/pages/Facturacion.jsx (marginBottom: 0px)
echo    - client/src/pages/SeleccionarPuntoVenta.jsx (position: fixed)
echo.

echo [4/4] Instrucciones para el navegador:
echo.
echo EN EL NAVEGADOR (Chrome/Edge):
echo    1. Presiona F12 para abrir DevTools
echo    2. Ve a la pestaña "Application"
echo    3. En "Service Workers", haz clic en "Unregister"
echo    4. En "Storage", haz clic en "Clear site data"
echo    5. Cierra DevTools
echo    6. Presiona Ctrl + Shift + R (recarga forzada)
echo.
echo O BIEN:
echo    - Abre el navegador en modo INCOGNITO (Ctrl + Shift + N)
echo    - Navega a tu aplicacion
echo    - Los cambios deberian verse inmediatamente
echo.

echo ========================================
echo   PRÓXIMOS PASOS
echo ========================================
echo.
echo Si usas desarrollo local:
echo    cd client
echo    npm run dev
echo.
echo Si necesitas recompilar para produccion:
echo    cd client
echo    npm run build
echo.

pause


