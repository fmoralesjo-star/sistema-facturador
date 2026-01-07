@echo off
setlocal enabledelayedexpansion
title Diagnosticar Backend - Sistema Facturador
color 0B
cls
echo.
echo ========================================
echo   DIAGNOSTICO DEL BACKEND
echo ========================================
echo.

cd /d "%~dp0backend-nestjs"

echo [1/6] Verificando Node.js...
where node >nul 2>&1
if errorlevel 1 (
    color 0C
    echo    [ERROR] Node.js NO esta instalado
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo    [OK] Node.js encontrado: %NODE_VERSION%

echo.
echo [2/6] Verificando npm...
where npm >nul 2>&1
if errorlevel 1 (
    color 0C
    echo    [ERROR] npm NO esta instalado
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo    [OK] npm encontrado: %NPM_VERSION%

echo.
echo [3/6] Verificando dependencias...
if not exist "node_modules" (
    color 0E
    echo    [ADVERTENCIA] node_modules NO existe
    echo    Ejecutando npm install...
    call npm install
    if errorlevel 1 (
        color 0C
        echo    [ERROR] Error al instalar dependencias
        pause
        exit /b 1
    )
) else (
    echo    [OK] node_modules existe
)

echo.
echo [4/6] Verificando archivo .env...
if exist ".env" (
    echo    [OK] Archivo .env existe
    echo    Contenido:
    type .env
) else (
    color 0E
    echo    [ADVERTENCIA] Archivo .env NO existe
    echo    Creando archivo .env basico...
    (
        echo # Configuracion del Backend
        echo PORT=3001
        echo NODE_ENV=development
        echo USE_FIRESTORE=true
    ) > .env
    echo    [OK] Archivo .env creado
)

echo.
echo [5/6] Verificando puerto 3001...
netstat -ano | findstr ":3001" >nul 2>&1
if errorlevel 1 (
    echo    [OK] Puerto 3001 disponible
) else (
    color 0E
    echo    [ADVERTENCIA] Puerto 3001 esta en uso
    echo    Procesos usando el puerto:
    netstat -ano | findstr ":3001"
)

echo.
echo [6/6] Intentando compilar el proyecto...
call npm run build > build-output.txt 2>&1
if errorlevel 1 (
    color 0C
    echo    [ERROR] Error al compilar el proyecto
    echo    Errores encontrados:
    type build-output.txt
    pause
    exit /b 1
) else (
    echo    [OK] Compilacion exitosa
)

echo.
echo ========================================
echo   DIAGNOSTICO COMPLETO
echo ========================================
echo.
echo Intentando iniciar el servidor...
echo.
pause

color 0A
call npm run start:dev

color 0C
echo.
echo ========================================
echo   EL SERVIDOR SE DETUVO
echo ========================================
pause


