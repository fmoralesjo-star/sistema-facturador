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
exports.FirestoreService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("./firebase.service");
const admin = require("firebase-admin");
let FirestoreService = class FirestoreService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
        this._db = null;
    }
    getDb() {
        if (!this._db) {
            this._db = this.firebaseService.getFirestore();
            if (!this._db) {
                throw new Error('Firestore no está inicializado. Configura Firebase primero.');
            }
        }
        return this._db;
    }
    isAvailable() {
        try {
            return !!this.firebaseService.getFirestore();
        }
        catch {
            return false;
        }
    }
    collection(collectionName) {
        return this.getDb().collection(collectionName);
    }
    async create(collectionName, data) {
        const docRef = await this.collection(collectionName).add({
            ...data,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return docRef.id;
    }
    async createWithId(collectionName, id, data) {
        await this.collection(collectionName).doc(id).set({
            ...data,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return id;
    }
    async findOne(collectionName, id) {
        const docRef = this.collection(collectionName).doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return null;
        }
        return {
            id: doc.id,
            ...doc.data(),
        };
    }
    async findAll(collectionName, filters, orderBy, limit) {
        let query = this.collection(collectionName);
        if (filters && filters.length > 0) {
            filters.forEach((filter) => {
                query = query.where(filter.field, filter.operator, filter.value);
            });
        }
        if (orderBy) {
            query = query.orderBy(orderBy.field, orderBy.direction);
        }
        if (limit) {
            query = query.limit(limit);
        }
        const snapshot = await query.get();
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    }
    async update(collectionName, id, data) {
        await this.collection(collectionName).doc(id).update({
            ...data,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    async delete(collectionName, id) {
        await this.collection(collectionName).doc(id).delete();
    }
    async deleteMany(collectionName, ids) {
        const batch = this.getDb().batch();
        ids.forEach((id) => {
            const docRef = this.collection(collectionName).doc(id);
            batch.delete(docRef);
        });
        await batch.commit();
    }
    async count(collectionName, filters) {
        let query = this.collection(collectionName);
        if (filters && filters.length > 0) {
            filters.forEach((filter) => {
                query = query.where(filter.field, filter.operator, filter.value);
            });
        }
        const snapshot = await query.get();
        return snapshot.size;
    }
    async findByField(collectionName, field, value) {
        return this.findAll(collectionName, [
            { field, operator: '==', value },
        ]);
    }
    async findOneByField(collectionName, field, value) {
        const results = await this.findByField(collectionName, field, value);
        return results.length > 0 ? results[0] : null;
    }
    async runTransaction(callback) {
        const db = this.getDb();
        if (!db) {
            throw new Error('Firestore no está inicializado. Configura Firebase primero.');
        }
        return db.runTransaction(callback);
    }
    createBatch() {
        const db = this.getDb();
        if (!db) {
            throw new Error('Firestore no está inicializado. Configura Firebase primero.');
        }
        return db.batch();
    }
    onSnapshot(collectionName, callback, filters) {
        let query = this.collection(collectionName);
        if (filters && filters.length > 0) {
            filters.forEach((filter) => {
                query = query.where(filter.field, filter.operator, filter.value);
            });
        }
        return query.onSnapshot((snapshot) => {
            const docs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            callback(docs);
        });
    }
};
exports.FirestoreService = FirestoreService;
exports.FirestoreService = FirestoreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], FirestoreService);
//# sourceMappingURL=firestore.service.js.map