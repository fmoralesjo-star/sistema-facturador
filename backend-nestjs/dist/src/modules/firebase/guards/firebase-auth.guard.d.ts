import { CanActivate, ExecutionContext } from '@nestjs/common';
import { FirebaseAuthService } from '../firebase-auth.service';
export declare class FirebaseAuthGuard implements CanActivate {
    private firebaseAuthService;
    constructor(firebaseAuthService: FirebaseAuthService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
