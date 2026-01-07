import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAuthService {
  constructor(private firebaseService: FirebaseService) {}

  async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
    if (!this.firebaseService.isInitialized()) {
      throw new UnauthorizedException('Firebase no está configurado');
    }

    try {
      const auth = this.firebaseService.getAuth();
      if (!auth) {
        throw new UnauthorizedException('Firebase Auth no está disponible');
      }

      const decodedToken = await auth.verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  async getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
    if (!this.firebaseService.isInitialized()) {
      throw new UnauthorizedException('Firebase no está configurado');
    }

    try {
      const auth = this.firebaseService.getAuth();
      if (!auth) {
        throw new UnauthorizedException('Firebase Auth no está disponible');
      }

      return await auth.getUser(uid);
    } catch (error) {
      throw new UnauthorizedException(`Usuario no encontrado: ${uid}`);
    }
  }

  async createUser(email: string, password: string, displayName?: string): Promise<admin.auth.UserRecord> {
    if (!this.firebaseService.isInitialized()) {
      throw new UnauthorizedException('Firebase no está configurado');
    }

    try {
      const auth = this.firebaseService.getAuth();
      if (!auth) {
        throw new UnauthorizedException('Firebase Auth no está disponible');
      }

      return await auth.createUser({
        email,
        password,
        displayName,
      });
    } catch (error) {
      throw new UnauthorizedException(`Error al crear usuario: ${error.message}`);
    }
  }

  async updateUser(uid: string, updates: admin.auth.UpdateRequest): Promise<admin.auth.UserRecord> {
    if (!this.firebaseService.isInitialized()) {
      throw new UnauthorizedException('Firebase no está configurado');
    }

    try {
      const auth = this.firebaseService.getAuth();
      if (!auth) {
        throw new UnauthorizedException('Firebase Auth no está disponible');
      }

      return await auth.updateUser(uid, updates);
    } catch (error) {
      throw new UnauthorizedException(`Error al actualizar usuario: ${error.message}`);
    }
  }

  async deleteUser(uid: string): Promise<void> {
    if (!this.firebaseService.isInitialized()) {
      throw new UnauthorizedException('Firebase no está configurado');
    }

    try {
      const auth = this.firebaseService.getAuth();
      if (!auth) {
        throw new UnauthorizedException('Firebase Auth no está disponible');
      }

      await auth.deleteUser(uid);
    } catch (error) {
      throw new UnauthorizedException(`Error al eliminar usuario: ${error.message}`);
    }
  }

  async setCustomUserClaims(uid: string, customClaims: Record<string, any>): Promise<void> {
    if (!this.firebaseService.isInitialized()) {
      throw new UnauthorizedException('Firebase no está configurado');
    }

    try {
      const auth = this.firebaseService.getAuth();
      if (!auth) {
        throw new UnauthorizedException('Firebase Auth no está disponible');
      }

      await auth.setCustomUserClaims(uid, customClaims);
    } catch (error) {
      throw new UnauthorizedException(`Error al establecer claims personalizados: ${error.message}`);
    }
  }
}


