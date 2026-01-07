// Utilidades para trabajar con Firestore
import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

/**
 * Guardar un documento en una colección
 * @param {string} collectionName - Nombre de la colección
 * @param {object} data - Datos a guardar
 * @returns {Promise<string>} - ID del documento creado
 */
export const guardarDocumento = async (collectionName, data) => {
  try {
    if (!db) {
      throw new Error('Firestore no está inicializado');
    }
    
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      creado: serverTimestamp(),
      actualizado: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error al guardar en ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Guardar un documento con ID específico
 * @param {string} collectionName - Nombre de la colección
 * @param {string} docId - ID del documento
 * @param {object} data - Datos a guardar
 */
export const guardarDocumentoConId = async (collectionName, docId, data) => {
  try {
    if (!db) {
      throw new Error('Firestore no está inicializado');
    }
    
    await setDoc(doc(db, collectionName, docId), {
      ...data,
      actualizado: serverTimestamp(),
    }, { merge: true });
    return docId;
  } catch (error) {
    console.error(`Error al guardar documento con ID en ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Obtener un documento por ID
 * @param {string} collectionName - Nombre de la colección
 * @param {string} docId - ID del documento
 * @returns {Promise<object|null>} - Documento o null si no existe
 */
export const obtenerDocumento = async (collectionName, docId) => {
  try {
    if (!db) {
      throw new Error('Firestore no está inicializado');
    }
    
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error al obtener documento de ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Obtener todos los documentos de una colección
 * @param {string} collectionName - Nombre de la colección
 * @param {object} options - Opciones de consulta
 * @returns {Promise<Array>} - Array de documentos
 */
export const obtenerDocumentos = async (collectionName, options = {}) => {
  try {
    if (!db) {
      throw new Error('Firestore no está inicializado');
    }
    
    let q = collection(db, collectionName);
    
    // Aplicar filtros
    if (options.where) {
      q = query(q, where(options.where.field, options.where.operator, options.where.value));
    }
    
    // Aplicar ordenamiento
    if (options.orderBy) {
      q = query(q, orderBy(options.orderBy.field, options.orderBy.direction || 'asc'));
    }
    
    // Aplicar límite
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    const querySnapshot = await getDocs(q);
    const documentos = [];
    
    querySnapshot.forEach((doc) => {
      documentos.push({ id: doc.id, ...doc.data() });
    });
    
    return documentos;
  } catch (error) {
    console.error(`Error al obtener documentos de ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Actualizar un documento
 * @param {string} collectionName - Nombre de la colección
 * @param {string} docId - ID del documento
 * @param {object} data - Datos a actualizar
 */
export const actualizarDocumento = async (collectionName, docId, data) => {
  try {
    if (!db) {
      throw new Error('Firestore no está inicializado');
    }
    
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      actualizado: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error al actualizar documento en ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Eliminar un documento
 * @param {string} collectionName - Nombre de la colección
 * @param {string} docId - ID del documento
 */
export const eliminarDocumento = async (collectionName, docId) => {
  try {
    if (!db) {
      throw new Error('Firestore no está inicializado');
    }
    
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    console.error(`Error al eliminar documento de ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Escuchar cambios en tiempo real
 * @param {string} collectionName - Nombre de la colección
 * @param {function} callback - Función a ejecutar cuando hay cambios
 * @param {object} options - Opciones de consulta
 * @returns {function} - Función para dejar de escuchar
 */
export const escucharDocumentos = (collectionName, callback, options = {}) => {
  try {
    if (!db) {
      throw new Error('Firestore no está inicializado');
    }
    
    let q = collection(db, collectionName);
    
    // Aplicar filtros
    if (options.where) {
      q = query(q, where(options.where.field, options.where.operator, options.where.value));
    }
    
    // Aplicar ordenamiento
    if (options.orderBy) {
      q = query(q, orderBy(options.orderBy.field, options.orderBy.direction || 'asc'));
    }
    
    // Aplicar límite
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const documentos = [];
        snapshot.forEach((doc) => {
          documentos.push({ id: doc.id, ...doc.data() });
        });
        callback(documentos);
      },
      (error) => {
        console.error(`Error al escuchar ${collectionName}:`, error);
        callback([], error);
      }
    );
    
    return unsubscribe;
  } catch (error) {
    console.error(`Error al configurar listener para ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Escuchar un documento específico en tiempo real
 * @param {string} collectionName - Nombre de la colección
 * @param {string} docId - ID del documento
 * @param {function} callback - Función a ejecutar cuando hay cambios
 * @returns {function} - Función para dejar de escuchar
 */
export const escucharDocumento = (collectionName, docId, callback) => {
  try {
    if (!db) {
      throw new Error('Firestore no está inicializado');
    }
    
    const docRef = doc(db, collectionName, docId);
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback({ id: docSnap.id, ...docSnap.data() });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error(`Error al escuchar documento de ${collectionName}:`, error);
        callback(null, error);
      }
    );
    
    return unsubscribe;
  } catch (error) {
    console.error(`Error al configurar listener para documento:`, error);
    throw error;
  }
};

