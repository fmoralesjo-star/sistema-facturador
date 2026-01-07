// Configuración de PM2 para mantener el servidor activo
// PM2 es un gestor de procesos para Node.js

module.exports = {
  apps: [
    {
      name: 'facturador-backend',
      script: './dist/main.js',
      cwd: './backend-nestjs',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      // Reiniciar si el proceso usa más de 1GB de RAM
    },
  ],
};


