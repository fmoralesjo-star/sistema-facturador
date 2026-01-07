"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
let FirebaseService = class FirebaseService {
    constructor(configService) {
        this.configService = configService;
    }
    onModuleInit() {
        try {
            const credentialsPath = this.configService.get('GOOGLE_APPLICATION_CREDENTIALS');
            if (credentialsPath && fs.existsSync(credentialsPath)) {
                console.log(`📄 Usando archivo de credenciales: ${credentialsPath}`);
                if (!admin.apps.length) {
                    this.app = admin.initializeApp({
                        credential: admin.credential.applicationDefault(),
                    });
                    console.log('✅ Firebase Admin inicializado correctamente desde archivo JSON');
                    return;
                }
                else {
                    this.app = admin.app();
                    console.log('✅ Firebase Admin ya estaba inicializado');
                    return;
                }
            }
            const projectRoot = path.resolve(__dirname, '../../../../');
            const jsonFiles = fs.readdirSync(projectRoot)
                .filter(file => file.includes('firebase-adminsdk') && file.endsWith('.json'));
            if (jsonFiles.length > 0) {
                const jsonPath = path.join(projectRoot, jsonFiles[0]);
                console.log(`📄 Encontrado archivo de credenciales: ${jsonFiles[0]}`);
                if (!admin.apps.length) {
                    const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                    this.app = admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount),
                        projectId: serviceAccount.project_id,
                    });
                    console.log('✅ Firebase Admin inicializado correctamente desde archivo JSON');
                    return;
                }
                else {
                    this.app = admin.app();
                    console.log('✅ Firebase Admin ya estaba inicializado');
                    return;
                }
            }
            const firebaseConfig = {
                type: this.configService.get('FIREBASE_TYPE'),
                project_id: this.configService.get('FIREBASE_PROJECT_ID'),
                private_key_id: this.configService.get('FIREBASE_PRIVATE_KEY_ID'),
                private_key: this.configService.get('FIREBASE_PRIVATE_KEY')?.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n'),
                client_email: this.configService.get('FIREBASE_CLIENT_EMAIL'),
                client_id: this.configService.get('FIREBASE_CLIENT_ID'),
                auth_uri: this.configService.get('FIREBASE_AUTH_URI') || 'https://accounts.google.com/o/oauth2/auth',
                token_uri: this.configService.get('FIREBASE_TOKEN_URI') || 'https://oauth2.googleapis.com/token',
                auth_provider_x509_cert_url: this.configService.get('FIREBASE_AUTH_PROVIDER_X509_CERT_URL') || 'https://www.googleapis.com/oauth2/v1/certs',
                client_x509_cert_url: this.configService.get('FIREBASE_CLIENT_X509_CERT_URL'),
            };
            if (!firebaseConfig.project_id) {
                console.warn('⚠️  Firebase no está configurado. No se encontraron credenciales.');
                console.warn('   El sistema funcionará sin Firebase. Para habilitarlo:');
                console.warn('   1. Coloca el archivo JSON de credenciales en la raíz del proyecto');
                console.warn('   2. O configura GOOGLE_APPLICATION_CREDENTIALS en .env');
                console.warn('   3. O configura las variables FIREBASE_* en .env');
                return;
            }
            if (!admin.apps.length) {
                this.app = admin.initializeApp({
                    credential: admin.credential.cert(firebaseConfig),
                    projectId: firebaseConfig.project_id,
                });
                console.log('✅ Firebase Admin inicializado correctamente desde variables de entorno');
            }
            else {
                this.app = admin.app();
                console.log('✅ Firebase Admin ya estaba inicializado');
            }
        }
        catch (error) {
            console.error('❌ Error al inicializar Firebase:', error.message);
            console.warn('   El sistema continuará sin Firebase');
        }
    }
    getApp() {
        return this.app || null;
    }
    getAuth() {
        return this.app?.auth() || null;
    }
    getFirestore() {
        return this.app?.firestore() || null;
    }
    isInitialized() {
        return !!this.app;
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map