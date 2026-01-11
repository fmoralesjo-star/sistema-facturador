#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🚀 Iniciando Build en Render..."

# 1. Instalar dependencias del Backend
echo "📦 Instalando dependencias del Backend..."
cd backend-nestjs
npm install

# 2. Compilar Backend
echo "🔨 Compilando Backend..."
npm run build

# 3. Volver a raíz e ir a Client
cd ..
cd client

# 4. Instalar dependencias del Frontend
echo "📦 Instalando dependencias del Frontend..."
npm install

# 5. Compilar Frontend
echo "🔨 Compilando Frontend (React Vite)..."
npm run build

# 6. Mover build del frontend a donde el backend lo espera
echo "🚚 Moviendo build al backend..."
# Regresar a root
cd ..
# Asegurar directorio destino
mkdir -p backend-nestjs/client/dist
# Copiar contenido
cp -r client/dist/* backend-nestjs/client/dist/

echo "✅ Build finalizado y archivos copiados."
