@echo off
setlocal enabledelayedexpansion
title Crear Producto de Ejemplo - Prenda de Ropa Talla XS
color 0B
cls
echo.
echo ========================================
echo   CREAR PRODUCTO DE EJEMPLO
echo   Prenda de Ropa - Talla XS
echo ========================================
echo.
echo Este script creará un producto de ejemplo completo:
echo   - Camiseta Básica - Talla XS
echo   - Con SKU, punto de reorden, stock de seguridad
echo   - Con lotes FIFO para valoración
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

REM Valores por defecto
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
    pause
    exit /b 1
)

echo Creando producto de ejemplo...
echo.

REM Ejecutar el script
if defined DB_PASSWORD (
    set PGPASSWORD=%DB_PASSWORD%
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USERNAME% -d %DB_DATABASE% -f "migrations\006_producto_ejemplo_prenda.sql"
) else (
    echo.
    echo Ingresa la contraseña de PostgreSQL cuando se solicite:
    echo.
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USERNAME% -d %DB_DATABASE% -f "migrations\006_producto_ejemplo_prenda.sql"
)

if errorlevel 1 (
    color 0C
    echo.
    echo ========================================
    echo   ERROR AL CREAR PRODUCTO
    echo ========================================
    echo.
    pause
    exit /b 1
) else (
    color 0A
    echo.
    echo ========================================
    echo   PRODUCTO DE EJEMPLO CREADO
    echo ========================================
    echo.
    echo Producto: Camiseta Básica - Talla XS
    echo Código: PRENDA-001
    echo SKU: PRENDA-XS-001
    echo Stock: 45 unidades
    echo Punto de Reorden: 30 unidades
    echo Stock de Seguridad: 15 unidades
    echo.
    echo El producto está listo para usar en el sistema.
    echo.
)

pause
exit /b 0
















