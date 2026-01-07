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
exports.FirebaseAuthService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("./firebase.service");
let FirebaseAuthService = class FirebaseAuthService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async verifyToken(token) {
        if (!this.firebaseService.isInitialized()) {
            throw new common_1.UnauthorizedException('Firebase no está configurado');
        }
        try {
            const auth = this.firebaseService.getAuth();
            if (!auth) {
                throw new common_1.UnauthorizedException('Firebase Auth no está disponible');
            }
            const decodedToken = await auth.verifyIdToken(token);
            return decodedToken;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token inválido o expirado');
        }
    }
    async getUserByUid(uid) {
        if (!this.firebaseService.isInitialized()) {
            throw new common_1.UnauthorizedException('Firebase no está configurado');
        }
        try {
            const auth = this.firebaseService.getAuth();
            if (!auth) {
                throw new common_1.UnauthorizedException('Firebase Auth no está disponible');
            }
            return await auth.getUser(uid);
        }
        catch (error) {
            throw new common_1.UnauthorizedException(`Usuario no encontrado: ${uid}`);
        }
    }
    async createUser(email, password, displayName) {
        if (!this.firebaseService.isInitialized()) {
            throw new common_1.UnauthorizedException('Firebase no está configurado');
        }
        try {
            const auth = this.firebaseService.getAuth();
            if (!auth) {
                throw new common_1.UnauthorizedException('Firebase Auth no está disponible');
            }
            return await auth.createUser({
                email,
                password,
                displayName,
            });
        }
        catch (error) {
            throw new common_1.UnauthorizedException(`Error al crear usuario: ${error.message}`);
        }
    }
    async updateUser(uid, updates) {
        if (!this.firebaseService.isInitialized()) {
            throw new common_1.UnauthorizedException('Firebase no está configurado');
        }
        try {
            const auth = this.firebaseService.getAuth();
            if (!auth) {
                throw new common_1.UnauthorizedException('Firebase Auth no está disponible');
            }
            return await auth.updateUser(uid, updates);
        }
        catch (error) {
            throw new common_1.UnauthorizedException(`Error al actualizar usuario: ${error.message}`);
        }
    }
    async deleteUser(uid) {
        if (!this.firebaseService.isInitialized()) {
            throw new common_1.UnauthorizedException('Firebase no está configurado');
        }
        try {
            const auth = this.firebaseService.getAuth();
            if (!auth) {
                throw new common_1.UnauthorizedException('Firebase Auth no está disponible');
            }
            await auth.deleteUser(uid);
        }
        catch (error) {
            throw new common_1.UnauthorizedException(`Error al eliminar usuario: ${error.message}`);
        }
    }
    async setCustomUserClaims(uid, customClaims) {
        if (!this.firebaseService.isInitialized()) {
            throw new common_1.UnauthorizedException('Firebase no está configurado');
        }
        try {
            const auth = this.firebaseService.getAuth();
            if (!auth) {
                throw new common_1.UnauthorizedException('Firebase Auth no está disponible');
            }
            await auth.setCustomUserClaims(uid, customClaims);
        }
        catch (error) {
            throw new common_1.UnauthorizedException(`Error al establecer claims personalizados: ${error.message}`);
        }
    }
};
exports.FirebaseAuthService = FirebaseAuthService;
exports.FirebaseAuthService = FirebaseAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], FirebaseAuthService);
//# sourceMappingURL=firebase-auth.service.js.map