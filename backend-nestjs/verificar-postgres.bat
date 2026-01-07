@echo off
title Verificar PostgreSQL
color 0B
cls
echo.
echo ========================================
echo   VERIFICANDO POSTGRESQL
echo ========================================
echo.

echo [1/3] Verificando si PostgreSQL esta corriendo...
sc query postgresql-x64-14 >nul 2>&1
if errorlevel 1 (
    echo    [ADVERTENCIA] No se pudo verificar el servicio PostgreSQL
    echo    Puede que PostgreSQL no este instalado como servicio
) else (
    echo    [OK] Servicio PostgreSQL encontrado
)

echo.
echo [2/3] Intentando conectar a PostgreSQL...
echo    Host: localhost
echo    Puerto: 5432
echo    Base de datos: facturador_db
echo    Usuario: facturador

psql -h localhost -p 5432 -U facturador -d facturador_db -c "SELECT version();" 2>nul
if errorlevel 1 (
    echo    [ERROR] No se pudo conectar a PostgreSQL
    echo.
    echo    Posibles causas:
    echo    - PostgreSQL no esta instalado
    echo    - PostgreSQL no esta corriendo
    echo    - Usuario/Base de datos no existe
    echo    - Contrasena incorrecta
    echo.
    echo    Solucion:
    echo    1. Instala PostgreSQL si no esta instalado
    echo    2. Crea la base de datos: facturador_db
    echo    3. Crea el usuario: facturador
    echo    4. O ajusta las credenciales en el archivo .env
) else (
    echo    [OK] Conexion a PostgreSQL exitosa
)

echo.
echo [3/3] Variables de entorno necesarias:
if defined DATABASE_HOST (
    echo    [OK] DATABASE_HOST=%DATABASE_HOST%
) else (
    echo    [ADVERTENCIA] DATABASE_HOST no configurado (usara: localhost)
)

if defined DATABASE_PORT (
    echo    [OK] DATABASE_PORT=%DATABASE_PORT%
) else (
    echo    [ADVERTENCIA] DATABASE_PORT no configurado (usara: 5432)
)

if defined DATABASE_USER (
    echo    [OK] DATABASE_USER=%DATABASE_USER%
) else (
    echo    [ADVERTENCIA] DATABASE_USER no configurado (usara: facturador)
)

if defined DATABASE_NAME (
    echo    [OK] DATABASE_NAME=%DATABASE_NAME%
) else (
    echo    [ADVERTENCIA] DATABASE_NAME no configurado (usara: facturador_db)
)

echo.
echo ========================================
echo   VERIFICACION COMPLETA
echo ========================================
echo.
pause










