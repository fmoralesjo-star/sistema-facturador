// Cargar variables de entorno PRIMERO, antes de importar módulos
// Esto asegura que USE_FIRESTORE esté disponible cuando se evalúen los módulos
import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express'; // Importante para useStaticAssets
import { AppModule } from './app.module';
import * as os from 'os';
import * as fs from 'fs';
import { join } from 'path';

// Main entry point - touched to force restart 2
console.log("🚀 STARTUP: DEPLOY_VERSION: 2026-01-08-FIX-DB-SYNC-V3-FORCED");
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Habilitar CORS PRIMERO, antes de cualquier ruta
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'https://sistema-faacturador-a510e.web.app',
    'https://sistema-faacturador-a510e.firebaseapp.com',
  ];


  // Obtener orígenes permitidos de variables de entorno (para producción)
  const envOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
  const allAllowedOrigins = [...allowedOrigins, ...envOrigins];

  // En desarrollo, permitir cualquier origen de la red local
  const isDevelopment = process.env.NODE_ENV !== 'production';

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origen (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // En desarrollo, permitir cualquier origen de localhost o IP local
      if (isDevelopment) {
        if (origin.includes('localhost') ||
          origin.includes('127.0.0.1') ||
          origin.match(/^http:\/\/192\.168\.\d+\.\d+:\d+$/) ||
          origin.match(/^http:\/\/10\.\d+\.\d+\.\d+:\d+$/) ||
          origin.match(/^https?:\/\/192\.168\.\d+\.\d+:\d+$/) ||
          origin.match(/^https?:\/\/10\.\d+\.\d+\.\d+:\d+$/)) {
          return callback(null, true);
        }
      }

      // En producción, verificar contra lista de orígenes permitidos
      // Permitir dominios de Render.com (patrón: *.onrender.com)
      if (allAllowedOrigins.includes(origin) ||
        allAllowedOrigins.some(allowed => origin.startsWith(allowed)) ||
        origin.endsWith('.onrender.com')) {
        callback(null, true);
      } else {
        console.warn(`⚠️  Origen bloqueado por CORS: ${origin}`);
        callback(new Error('No permitido por CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
  });

  // Endpoint de health sin prefijo (para verificación de conectividad)
  app.getHttpAdapter().get('/health', (req: any, res: any) => {
    res.json({
      status: 'OK',
      message: 'Sistema Facturador Backend v2.0',
    });
  });

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  // Configuración de Frontend (Archivos Estáticos)
  // Nota: Esto asume que el build de React está en ../client/dist o donde indique CLIENT_PATH
  let clientPath = process.env.CLIENT_PATH || join(__dirname, '..', '..', 'client', 'dist');

  // Fallback: Si no encuentra ../client/dist, verificar si están en el mismo directorio (deploy híbrido)
  if (!process.env.CLIENT_PATH && !fs.existsSync(clientPath)) {
    const localPath = __dirname;
    if (fs.existsSync(join(localPath, 'index.html'))) {
      console.log('📂 Usando fallback de frontend en:', localPath);
      clientPath = localPath;
    }
  }

  if (fs.existsSync(clientPath)) {
    console.log(`📂 Sirviendo Frontend desde: ${clientPath}`);
    app.useStaticAssets(clientPath);
    // Servir uploads de imágenes
    const uploadsPath = join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }
    app.useStaticAssets(uploadsPath, {
      prefix: '/uploads/',
    });

    // SPA Fallback: Cualquier ruta que no empiece con /api devuelve index.html
    // Interceptamos 404s en el lado de NestJS para rutas no encontradas y enviamos index.html
    app.use((req: any, res: any, next: any) => {
      if (!req.path.startsWith('/api') && req.method === 'GET') {
        const indexPath = join(clientPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          return res.sendFile(indexPath);
        }
      }
      next();
    });
  } else {
    console.warn(`⚠️ No se encontró build del Frontend en: ${clientPath}`);
    console.warn('   Ejecuta "npm run build" en ./client y asegúrate que la ruta sea correcta.');

    // Fallback original solo si no hay frontend
    app.getHttpAdapter().get('/', (req: any, res: any) => {
      let files = [];
      try {
        files = fs.readdirSync(__dirname);
      } catch (e) { files = ['error reading dir']; }

      res.json({
        message: 'Backend Running (Frontend not found)',
        path: clientPath,
        currentDir: __dirname,
        filesInCurrentDir: files
      });
    });
  }

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Cloud Run usa PORT automáticamente
  const port = process.env.PORT || 3001;

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server running on http://localhost:${port}`);

  if (fs.existsSync(clientPath)) {
    console.log(`🎨 Frontend served at http://localhost:${port}`);
  }
}
bootstrap();
