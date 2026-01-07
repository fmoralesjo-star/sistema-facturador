import { FirebaseService } from './firebase.service';
import * as admin from 'firebase-admin';
export declare class FirebaseAuthService {
    private firebaseService;
    constructor(firebaseService: FirebaseService);
    verifyToken(token: string): Promise<admin.auth.DecodedIdToken>;
    getUserByUid(uid: string): Promise<admin.auth.UserRecord>;
    createUser(email: string, password: string, displayName?: string): Promise<admin.auth.UserRecord>;
    updateUser(uid: string, updates: admin.auth.UpdateRequest): Promise<admin.auth.UserRecord>;
    deleteUser(uid: string): Promise<void>;
    setCustomUserClaims(uid: string, customClaims: Record<string, any>): Promise<void>;
}
