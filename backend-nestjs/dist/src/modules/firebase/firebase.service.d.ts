import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
export declare class FirebaseService implements OnModuleInit {
    private configService;
    private app;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    getApp(): admin.app.App | null;
    getAuth(): admin.auth.Auth | null;
    getFirestore(): admin.firestore.Firestore | null;
    isInitialized(): boolean;
}
