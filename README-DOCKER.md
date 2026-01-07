# 🐳 Guía de Despliegue con Docker

Este proyecto está completamente contenerizado para facilitar su instalación y ejecución en cualquier entorno.

## Requisitos Previos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo.

## Iniciar el Sistema (Quick Start)

1.  Abre una terminal en la carpeta raíz del proyecto.
2.  Ejecuta:
    ```bash
    docker-compose up -d
    ```
    *(La primera vez tardará unos minutos en descargar imágenes y construir el proyecto)*.

3.  ¡Listo! Accede a:
    - **Frontend**: http://localhost (Puerto 80)
    - **Backend API**: http://localhost:3000
    - **Base de Datos**: localhost:5432
    - **Redis**: localhost:6379

## Comandos Útiles

- **Detener el sistema**:
  ```bash
  docker-compose down
  ```

- **Ver logs en tiempo real**:
  ```bash
  docker-compose logs -f
  ```

- **Reconstruir (si cambiaste código)**:
  ```bash
  docker-compose up -d --build
  ```

## Estructura de Servicios

- **frontend**: Servidor Nginx sirviendo la app React. Redirige `/api` al backend internamente.
- **backend**: Servidor NestJS. Conectado a `db` y `redis`.
- **db**: PostgreSQL 14. Datos persistentes en volumen `postgres_data`.
- **redis**: Redis 7. Usado para colas de mensajería (SRI). Datos persistentes en `redis_data`.

## Notas de Producción
- Asegúrate de configurar las variables de entorno (contraseñas) en un archivo `.env` si despliegas en un servidor público.
- La carpeta `certs` del backend está mapeada a un volumen, por lo que tus firmas electrónicas persistirán aunque borres el contenedor.
