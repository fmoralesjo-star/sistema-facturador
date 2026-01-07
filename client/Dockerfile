# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Construir la aplicación para producción
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copiar configuración custom de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos del build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
