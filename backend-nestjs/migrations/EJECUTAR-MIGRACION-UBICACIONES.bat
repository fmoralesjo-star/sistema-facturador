@echo off
setlocal enabledelayedexpansion
title Migración: Agregar Sistema de Ubicaciones
color 0B
cls
echo.
echo ========================================
echo   MIGRACIÓN: SISTEMA DE UBICACIONES
echo   Sistema Facturador v2.0
echo ========================================
echo.
echo Este script agregará las tablas de ubicaciones
echo (bodegas, pasillos, estantes) al sistema
echo.
echo IMPORTANTE: Asegúrate de que PostgreSQL esté corriendo
echo y que tengas las credenciales correctas en el archivo .env
echo.
echo Presiona cualquier tecla para continuar...
pause >nul

cd /d "%~dp0"

REM Cargar variables de entorno desde .env si existe
if exist ".env" (
    echo Cargando variables de entorno desde .env...
    for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
        if "%%a"=="DB_HOST" set DB_HOST=%%b
        if "%%a"=="DB_PORT" set DB_PORT=%%b
        if "%%a"=="DB_USERNAME" set DB_USERNAME=%%b
        if "%%a"=="DB_PASSWORD" set DB_PASSWORD=%%b
        if "%%a"=="DB_DATABASE" set DB_DATABASE=%%b
    )
)

REM Valores por defecto si no están en .env
if not defined DB_HOST set DB_HOST=localhost
if not defined DB_PORT set DB_PORT=5432
if not defined DB_USERNAME set DB_USERNAME=postgres
if not defined DB_DATABASE set DB_DATABASE=facturador_db

echo.
echo Configuración de conexión:
echo   Host: %DB_HOST%
echo   Puerto: %DB_PORT%
echo   Usuario: %DB_USERNAME%
echo   Base de datos: %DB_DATABASE%
echo.

REM Verificar si psql está disponible
where psql >nul 2>&1
if errorlevel 1 (
    color 0C
    echo ERROR: psql no encontrado
    echo.
    echo Por favor instala PostgreSQL o agrega psql al PATH
    echo.
    pause
    exit /b 1
)

echo Ejecutando migración...
echo.

REM Ejecutar la migración
if defined DB_PASSWORD (
    set PGPASSWORD=%DB_PASSWORD%
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USERNAME% -d %DB_DATABASE% -f "migrations\002_agregar_ubicaciones.sql"
) else (
    echo.
    echo Ingresa la contraseña de PostgreSQL cuando se solicite:
    echo.
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USERNAME% -d %DB_DATABASE% -f "migrations\002_agregar_ubicaciones.sql"
)

if errorlevel 1 (
    color 0C
    echo.
    echo ========================================
    echo   ERROR AL EJECUTAR LA MIGRACIÓN
    echo ========================================
    echo.
    echo Verifica:
    echo   1. Que PostgreSQL esté corriendo
    echo   2. Que las credenciales sean correctas
    echo   3. Que la base de datos exista
    echo.
    pause
    exit /b 1
) else (
    color 0A
    echo.
    echo ========================================
    echo   MIGRACIÓN COMPLETADA EXITOSAMENTE
    echo ========================================
    echo.
    echo Las tablas de ubicaciones han sido creadas:
    echo   - ubicaciones
    echo   - productos_ubicaciones
    echo.
    echo Ahora puedes gestionar ubicaciones desde el módulo de inventario
    echo.
)

pause
exit /b 0
















