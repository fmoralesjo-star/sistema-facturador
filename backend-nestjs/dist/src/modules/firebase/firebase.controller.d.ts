import { FirebaseAuthService } from './firebase-auth.service';
export declare class FirebaseController {
    private firebaseAuthService;
    constructor(firebaseAuthService: FirebaseAuthService);
    verifyToken(body: {
        token: string;
    }): Promise<{
        valid: boolean;
        uid: string;
        email: string;
        name: any;
        error?: undefined;
    } | {
        valid: boolean;
        error: any;
        uid?: undefined;
        email?: undefined;
        name?: undefined;
    }>;
    getCurrentUser(user: any): Promise<{
        uid: any;
        email: any;
        name: any;
        picture: any;
    }>;
}
