import { FirebaseService } from './firebase.service';
import * as admin from 'firebase-admin';
export declare class FirestoreService {
    private firebaseService;
    private _db;
    constructor(firebaseService: FirebaseService);
    private getDb;
    isAvailable(): boolean;
    collection(collectionName: string): admin.firestore.CollectionReference;
    create<T extends Record<string, any>>(collectionName: string, data: T): Promise<string>;
    createWithId<T extends Record<string, any>>(collectionName: string, id: string, data: T): Promise<string>;
    findOne<T = any>(collectionName: string, id: string): Promise<T | null>;
    findAll<T = any>(collectionName: string, filters?: Array<{
        field: string;
        operator: admin.firestore.WhereFilterOp;
        value: any;
    }>, orderBy?: {
        field: string;
        direction: 'asc' | 'desc';
    }, limit?: number): Promise<T[]>;
    update<T extends Record<string, any>>(collectionName: string, id: string, data: Partial<T>): Promise<void>;
    delete(collectionName: string, id: string): Promise<void>;
    deleteMany(collectionName: string, ids: string[]): Promise<void>;
    count(collectionName: string, filters?: Array<{
        field: string;
        operator: admin.firestore.WhereFilterOp;
        value: any;
    }>): Promise<number>;
    findByField<T = any>(collectionName: string, field: string, value: any): Promise<T[]>;
    findOneByField<T = any>(collectionName: string, field: string, value: any): Promise<T | null>;
    runTransaction<T>(callback: (transaction: admin.firestore.Transaction) => Promise<T>): Promise<T>;
    createBatch(): admin.firestore.WriteBatch;
    onSnapshot<T = any>(collectionName: string, callback: (docs: T[]) => void, filters?: Array<{
        field: string;
        operator: admin.firestore.WhereFilterOp;
        value: any;
    }>): () => void;
}
