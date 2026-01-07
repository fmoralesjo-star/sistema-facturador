import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: admin.app.App;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    try {
      // Opción 1: Intentar usar archivo JSON directamente (GOOGLE_APPLICATION_CREDENTIALS)
      const credentialsPath = this.configService.get('GOOGLE_APPLICATION_CREDENTIALS');
      if (credentialsPath && fs.existsSync(credentialsPath)) {
        console.log(`📄 Usando archivo de credenciales: ${credentialsPath}`);
        if (!admin.apps.length) {
          this.app = admin.initializeApp({
            credential: admin.credential.applicationDefault(),
          });
          console.log('✅ Firebase Admin inicializado correctamente desde archivo JSON');
          return;
        } else {
          this.app = admin.app();
          console.log('✅ Firebase Admin ya estaba inicializado');
          return;
        }
      }

      // Opción 2: Buscar archivos JSON en la raíz del proyecto
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
        } else {
          this.app = admin.app();
          console.log('✅ Firebase Admin ya estaba inicializado');
          return;
        }
      }

      // Opción 3: Obtener credenciales de Firebase desde variables de entorno
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

      // Verificar si hay configuración de Firebase
      if (!firebaseConfig.project_id) {
        console.warn('⚠️  Firebase no está configurado. No se encontraron credenciales.');
        console.warn('   El sistema funcionará sin Firebase. Para habilitarlo:');
        console.warn('   1. Coloca el archivo JSON de credenciales en la raíz del proyecto');
        console.warn('   2. O configura GOOGLE_APPLICATION_CREDENTIALS en .env');
        console.warn('   3. O configura las variables FIREBASE_* en .env');
        return;
      }

      // Inicializar Firebase Admin desde variables de entorno
      if (!admin.apps.length) {
        this.app = admin.initializeApp({
          credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
          projectId: firebaseConfig.project_id,
        });
        console.log('✅ Firebase Admin inicializado correctamente desde variables de entorno');
      } else {
        this.app = admin.app();
        console.log('✅ Firebase Admin ya estaba inicializado');
      }
    } catch (error) {
      console.error('❌ Error al inicializar Firebase:', error.message);
      console.warn('   El sistema continuará sin Firebase');
    }
  }

  getApp(): admin.app.App | null {
    return this.app || null;
  }

  getAuth(): admin.auth.Auth | null {
    return this.app?.auth() || null;
  }

  getFirestore(): admin.firestore.Firestore | null {
    return this.app?.firestore() || null;
  }

  isInitialized(): boolean {
    return !!this.app;
  }
}


