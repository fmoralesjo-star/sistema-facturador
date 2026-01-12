// Utilidad para detectar automáticamente la URL de la API
// Funciona en diferentes dispositivos y redes

// URL del backend en Cloud Run (producción)
// URL del backend en Render (producción)
const RENDER_BACKEND_URL = 'https://sistema-facturador-ln63.onrender.com/api';
const RENDER_BACKEND_ALT = 'https://sistema-facturador.onrender.com/api';

export function detectApiUrl() {
  // 1. PRIORIDAD MÁXIMA: Variable de entorno configurada
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    console.log('🔧 Using VITE_API_URL from environment:', envUrl);
    return envUrl;
  }

  // 2. Detectar la URL actual del navegador
  const currentHost = window.location.hostname;
  const currentProtocol = window.location.protocol;
  const currentOrigin = window.location.origin;

  // 3. Verificar si estamos en localhost (desarrollo)
  const isLocalhost = currentHost === 'localhost' ||
    currentHost === '127.0.0.1' ||
    currentHost === '' ||
    currentProtocol === 'file:';

  // 4. Si estamos en localhost, usar localhost para la API (desarrollo)
  if (isLocalhost) {
    console.log('💻 Modo desarrollo detectado, usando localhost');
    return 'http://localhost:3001/api';
  }

  // 5. Si estamos en producción (Render, Firebase, etc.)
  // Usar el backend de Render desplegado
  const prodUrl = RENDER_BACKEND_URL;

  // Si estamos desplegados en Render, usar la URL del backend de Render
  if (currentHost.includes('onrender.com')) {
    // Si hay VITE_API_URL configurada, ya se habría usado arriba
    // Si no, avisar que falta configuración
    console.warn('⚠️ Desplegado en Render pero VITE_API_URL no configurada');
    console.warn('   Usando Render Backend como fallback:', prodUrl);
    // Intento de usar la URL alternativa si estamos en el dominio alternativo (auto-detect)
    if (currentHost.includes('sistema-facturador.onrender.com')) {
      return RENDER_BACKEND_ALT;
    }
  }

  console.log('🌐 Modo producción detectado, usando:', prodUrl);
  console.log('   Hostname:', currentHost);
  console.log('   Origin:', currentOrigin);
  return prodUrl;
}

export function detectSocketUrl() {
  const apiUrl = detectApiUrl();
  // Remover /api del final y usar para Socket.io
  const socketUrl = apiUrl.replace('/api', '');

  // Si es Cloud Run, asegurar que use HTTPS
  if (socketUrl.includes('run.app')) {
    return socketUrl.replace('http://', 'https://');
  }

  return socketUrl;
}


