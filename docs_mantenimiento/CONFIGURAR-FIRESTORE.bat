@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🔥 CONFIGURAR FIRESTORE EN CLOUD RUN
echo ========================================
echo.
echo Este script ejecutará el script de PowerShell para configurar Firestore.
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0CONFIGURAR-FIRESTORE.ps1"
pause
