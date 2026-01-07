// Configuración de la API
// En Vite, usar import.meta.env en lugar de process.env
import { detectApiUrl, detectSocketUrl } from '../utils/detectApiUrl';

// URL de Cloud Run para producción
const CLOUD_RUN_API = 'https://sistema-facturador-backend-384727658140.us-central1.run.app/api';
const CLOUD_RUN_SOCKET = 'https://sistema-facturador-backend-384727658140.us-central1.run.app';

// Detectar automáticamente la URL de la API basándose en la ubicación actual
// Esto permite que funcione en diferentes dispositivos y redes
const detectedApiUrl = detectApiUrl();
const detectedSocketUrl = detectSocketUrl();

// FORZAR Cloud Run si NO estamos en localhost
const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '' ||
  window.location.protocol === 'file:'
);

// Si hay variable de entorno y no es localhost, usarla
const finalApiUrl = import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')
  ? import.meta.env.VITE_API_URL
  : (!isLocalhost ? CLOUD_RUN_API : detectedApiUrl);

const finalSocketUrl = import.meta.env.VITE_SOCKET_URL && !import.meta.env.VITE_SOCKET_URL.includes('localhost')
  ? import.meta.env.VITE_SOCKET_URL
  : (!isLocalhost ? CLOUD_RUN_SOCKET : detectedSocketUrl);

export const API_URL = finalApiUrl;
export const SOCKET_URL = finalSocketUrl;

// Log para debugging (siempre mostrar en consola para verificar)
  console.log('🔗 URLs detectadas:');
console.log(`   Hostname: ${window.location.hostname}`);
console.log(`   Origin: ${window.location.origin}`);
  console.log(`   API: ${API_URL}`);
  console.log(`   Socket: ${SOCKET_URL}`);
console.log(`   Modo: ${import.meta.env.PROD ? 'PRODUCCIÓN' : 'DESARROLLO'}`);

