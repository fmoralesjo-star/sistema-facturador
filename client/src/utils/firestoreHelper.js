// Utilidades para trabajar con Firestore - NEUTRALIZADO
// Se mantienen las firmas de función para no romper llamadas existentes, pero no hacen nada.

console.warn('⚠️ firestoreHelper.js: Firestore ha sido desactivado. Las funciones retornarán valores vacíos.');

export const guardarDocumento = async (collectionName, data) => {
  console.warn(`[Firestore Desactivado] guardarDocumento en ${collectionName}`, data);
  return 'mock_id_' + Date.now();
};

export const guardarDocumentoConId = async (collectionName, docId, data) => {
  console.warn(`[Firestore Desactivado] guardarDocumentoConId en ${collectionName}/${docId}`, data);
  return docId;
};

export const obtenerDocumento = async (collectionName, docId) => {
  console.warn(`[Firestore Desactivado] obtenerDocumento de ${collectionName}/${docId}`);
  return null;
};

export const obtenerDocumentos = async (collectionName, options = {}) => {
  console.warn(`[Firestore Desactivado] obtenerDocumentos de ${collectionName}`, options);
  return [];
};

export const actualizarDocumento = async (collectionName, docId, data) => {
  console.warn(`[Firestore Desactivado] actualizarDocumento en ${collectionName}/${docId}`, data);
};

export const eliminarDocumento = async (collectionName, docId) => {
  console.warn(`[Firestore Desactivado] eliminarDocumento en ${collectionName}/${docId}`);
};

export const escucharDocumentos = (collectionName, callback, options = {}) => {
  console.warn(`[Firestore Desactivado] escucharDocumentos en ${collectionName}`);
  // Simular respuesta vacía inmediata
  callback([]);
  // Retornar función unsubscribe dummy
  return () => { };
};

export const escucharDocumento = (collectionName, docId, callback) => {
  console.warn(`[Firestore Desactivado] escucharDocumento en ${collectionName}/${docId}`);
  callback(null);
  return () => { };
};

