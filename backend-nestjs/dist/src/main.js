"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const fs = require("fs");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
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
    const envOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
    const allAllowedOrigins = [...allowedOrigins, ...envOrigins];
    const isDevelopment = process.env.NODE_ENV !== 'production';
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) {
                return callback(null, true);
            }
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
            if (allAllowedOrigins.includes(origin) ||
                allAllowedOrigins.some(allowed => origin.startsWith(allowed)) ||
                origin.endsWith('.onrender.com')) {
                callback(null, true);
            }
            else {
                console.warn(`⚠️  Origen bloqueado por CORS: ${origin}`);
                callback(new Error('No permitido por CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
    });
    app.getHttpAdapter().get('/health', (req, res) => {
        res.json({
            status: 'OK',
            message: 'Sistema Facturador Backend v2.0',
        });
    });
    app.setGlobalPrefix('api');
    const clientPath = process.env.CLIENT_PATH || (0, path_1.join)(__dirname, '..', 'client', 'dist');
    if (fs.existsSync(clientPath)) {
        console.log(`📂 Sirviendo Frontend desde: ${clientPath}`);
        app.useStaticAssets(clientPath);
        app.use((req, res, next) => {
            if (!req.path.startsWith('/api') && req.method === 'GET') {
                const indexPath = (0, path_1.join)(clientPath, 'index.html');
                if (fs.existsSync(indexPath)) {
                    return res.sendFile(indexPath);
                }
            }
            next();
        });
    }
    else {
        console.warn(`⚠️ No se encontró build del Frontend en: ${clientPath}`);
        console.warn('   Ejecuta "npm run build" en ./client y asegúrate que la ruta sea correcta.');
        app.getHttpAdapter().get('/', (req, res) => {
            res.json({ message: 'Backend Running (Frontend not found)', path: clientPath });
        });
    }
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const port = process.env.PORT || 3001;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Server running on http://localhost:${port}`);
    if (fs.existsSync(clientPath)) {
        console.log(`🎨 Frontend served at http://localhost:${port}`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map