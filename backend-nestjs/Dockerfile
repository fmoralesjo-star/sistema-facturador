# --- Stage 1: Build Frontend ---
FROM node:18-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build
# Output: /app/client/dist

# --- Stage 2: Build Backend ---
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
# Dependencias nativas para backend
RUN apk add --no-cache python3 make g++ cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev
COPY backend-nestjs/package*.json ./
RUN npm ci
COPY backend-nestjs/ .
RUN npm run build
# Output: /app/backend/dist

# --- Stage 3: Production Image ---
FROM node:18-alpine

WORKDIR /app

# Dependencias nativas runtime
RUN apk add --no-cache cairo pango jpeg giflib librsvg

# Crear estructura
RUN mkdir -p /app/backend /app/client/dist /app/backend/certs /app/backend/logs

# Copiar paquetes Backend
COPY backend-nestjs/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

# Copiar Build Backend
COPY --from=backend-builder /app/backend/dist ./dist

# Copiar Build Frontend al lugar donde NestJS lo espera
COPY --from=frontend-builder /app/client/dist ../client/dist

# Asignar permisos usuario node
RUN chown -R node:node /app

USER node

# Env Vars por defecto
ENV PORT=3000
ENV NODE_ENV=production
# Le decimos a NestJS donde está el frontend (aunque por defecto pusimos ../client/dist)
ENV CLIENT_PATH=/app/client/dist

EXPOSE 3000

CMD ["node", "dist/main"]
