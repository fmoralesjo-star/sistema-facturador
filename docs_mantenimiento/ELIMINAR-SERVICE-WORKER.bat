@echo off
setlocal enabledelayedexpansion
title ELIMINAR SERVICE WORKER COMPLETAMENTE

echo.
echo ========================================
echo   ELIMINAR SERVICE WORKER
echo ========================================
echo.
echo Este script te dara instrucciones para eliminar
echo el Service Worker que esta cacheando tus cambios.
echo.
echo IMPORTANTE: Debes hacer esto en el NAVEGADOR
echo.

echo.
echo PASO 1: Abre tu navegador (Chrome o Edge)
echo.
echo PASO 2: Ve a tu aplicacion:
echo    http://localhost:5173/facturacion
echo.
echo PASO 3: Presiona F12 (abrir DevTools)
echo.
echo PASO 4: Ve a la pestaña "Application" (Aplicacion)
echo.
echo PASO 5: En el menu izquierdo, busca "Service Workers"
echo.
echo PASO 6: Veras una lista de Service Workers registrados
echo.
echo PASO 7: Para cada Service Worker, haz click en "Unregister"
echo.
echo PASO 8: Luego ve a "Storage" -^> "Clear site data"
echo         (O: Almacenamiento -^> Borrar datos del sitio)
echo.
echo PASO 9: Marca TODAS las opciones y haz click en "Clear site data"
echo.
echo PASO 10: Cierra el navegador completamente
echo.
echo PASO 11: Abre el navegador de nuevo en modo INCOGNITO:
echo          Ctrl + Shift + N
echo.
echo PASO 12: Ve a: http://localhost:5173/facturacion
echo.
echo ========================================
echo.
echo Si prefieres hacerlo automaticamente desde JavaScript,
echo ejecuta en la consola del navegador (F12 -^> Console):
echo.
echo navigator.serviceWorker.getRegistrations().then(function(registrations) {
echo   for(let registration of registrations) {
echo     registration.unregister()
echo   }
echo })
echo.
echo ========================================
echo.
pause
exit /b 0

