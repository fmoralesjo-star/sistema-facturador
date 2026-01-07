import { Injectable } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import * as admin from 'firebase-admin';

@Injectable()
export class FirestoreService {
  private _db: admin.firestore.Firestore | null = null;

  constructor(private firebaseService: FirebaseService) {}

  /**
   * Obtiene la instancia de Firestore (lazy initialization)
   */
  private getDb(): admin.firestore.Firestore {
    if (!this._db) {
      this._db = this.firebaseService.getFirestore();
      if (!this._db) {
        throw new Error('Firestore no está inicializado. Configura Firebase primero.');
      }
    }
    return this._db;
  }

  /**
   * Verifica si Firestore está disponible
   */
  isAvailable(): boolean {
    try {
      return !!this.firebaseService.getFirestore();
    } catch {
      return false;
    }
  }

  /**
   * Obtiene una colección
   */
  collection(collectionName: string): admin.firestore.CollectionReference {
    return this.getDb().collection(collectionName);
  }

  /**
   * Crea un documento en una colección
   */
  async create<T extends Record<string, any>>(
    collectionName: string,
    data: T,
  ): Promise<string> {
    const docRef = await this.collection(collectionName).add({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
  }

  /**
   * Crea un documento con un ID específico
   */
  async createWithId<T extends Record<string, any>>(
    collectionName: string,
    id: string,
    data: T,
  ): Promise<string> {
    await this.collection(collectionName).doc(id).set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return id;
  }

  /**
   * Obtiene un documento por ID
   */
  async findOne<T = any>(
    collectionName: string,
    id: string,
  ): Promise<T | null> {
    const docRef = this.collection(collectionName).doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as T;
  }

  /**
   * Obtiene todos los documentos de una colección
   */
  async findAll<T = any>(
    collectionName: string,
    filters?: Array<{
      field: string;
      operator: admin.firestore.WhereFilterOp;
      value: any;
    }>,
    orderBy?: { field: string; direction: 'asc' | 'desc' },
    limit?: number,
  ): Promise<T[]> {
    let query: admin.firestore.Query = this.collection(collectionName);

    // Aplicar filtros
    if (filters && filters.length > 0) {
      filters.forEach((filter) => {
        query = query.where(filter.field, filter.operator, filter.value);
      });
    }

    // Aplicar ordenamiento
    if (orderBy) {
      query = query.orderBy(orderBy.field, orderBy.direction);
    }

    // Aplicar límite
    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  }

  /**
   * Actualiza un documento
   */
  async update<T extends Record<string, any>>(
    collectionName: string,
    id: string,
    data: Partial<T>,
  ): Promise<void> {
    await this.collection(collectionName).doc(id).update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  /**
   * Elimina un documento
   */
  async delete(collectionName: string, id: string): Promise<void> {
    await this.collection(collectionName).doc(id).delete();
  }

  /**
   * Elimina múltiples documentos
   */
  async deleteMany(
    collectionName: string,
    ids: string[],
  ): Promise<void> {
    const batch = this.getDb().batch();
    ids.forEach((id) => {
      const docRef = this.collection(collectionName).doc(id);
      batch.delete(docRef);
    });
    await batch.commit();
  }

  /**
   * Cuenta documentos en una colección
   */
  async count(
    collectionName: string,
    filters?: Array<{
      field: string;
      operator: admin.firestore.WhereFilterOp;
      value: any;
    }>,
  ): Promise<number> {
    let query: admin.firestore.Query = this.collection(collectionName);

    if (filters && filters.length > 0) {
      filters.forEach((filter) => {
        query = query.where(filter.field, filter.operator, filter.value);
      });
    }

    const snapshot = await query.get();
    return snapshot.size;
  }

  /**
   * Busca documentos por campo
   */
  async findByField<T = any>(
    collectionName: string,
    field: string,
    value: any,
  ): Promise<T[]> {
    return this.findAll<T>(collectionName, [
      { field, operator: '==', value },
    ]);
  }

  /**
   * Busca un documento por campo (primer resultado)
   */
  async findOneByField<T = any>(
    collectionName: string,
    field: string,
    value: any,
  ): Promise<T | null> {
    const results = await this.findByField<T>(collectionName, field, value);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Ejecuta una transacción
   */
  async runTransaction<T>(
    callback: (transaction: admin.firestore.Transaction) => Promise<T>,
  ): Promise<T> {
    const db = this.getDb();
    if (!db) {
      throw new Error('Firestore no está inicializado. Configura Firebase primero.');
    }
    return db.runTransaction(callback);
  }

  /**
   * Crea un batch para operaciones múltiples
   */
  createBatch(): admin.firestore.WriteBatch {
    const db = this.getDb();
    if (!db) {
      throw new Error('Firestore no está inicializado. Configura Firebase primero.');
    }
    return db.batch();
  }

  /**
   * Escucha cambios en tiempo real
   */
  onSnapshot<T = any>(
    collectionName: string,
    callback: (docs: T[]) => void,
    filters?: Array<{
      field: string;
      operator: admin.firestore.WhereFilterOp;
      value: any;
    }>,
  ): () => void {
    let query: admin.firestore.Query = this.collection(collectionName);

    if (filters && filters.length > 0) {
      filters.forEach((filter) => {
        query = query.where(filter.field, filter.operator, filter.value);
      });
    }

    return query.onSnapshot((snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
      callback(docs);
    });
  }
}

