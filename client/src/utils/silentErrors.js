// Utilidad para silenciar errores esperados en la consola

// Lista de errores que deben ser silenciados
const SILENT_ERRORS = [
  '503',
  'ECONNREFUSED',
  'ERR_NETWORK',
  'Network Error',
  'timeout',
  'Failed to fetch',
  'WebSocket connection failed',
  'failed to connect to websocket',
  'Service Unavailable',
  'logotipo', // Silenciar error 404 cuando no hay logo
];

// Función para verificar si un error debe ser silenciado
export function shouldSilenceError(error) {
  if (!error) return false;

  /* Safe string conversion before cleaning */
  const errorString = JSON.stringify(error).toLowerCase();
  const errorMessage = String(error.message || '').toLowerCase();
  const errorCode = String(error.code || '').toLowerCase();
  const status = String(error.response?.status || '').toString();
  const url = String(error.config?.url || '').toLowerCase();

  return SILENT_ERRORS.some(silentError =>
    errorString.includes(silentError.toLowerCase()) ||
    errorMessage.includes(silentError.toLowerCase()) ||
    errorCode.includes(silentError.toLowerCase()) ||
    status === silentError ||
    (silentError === '503' && status === '503')
  );
}

// Interceptar errores de red antes de que lleguen a la consola
const originalConsoleError = console.error;
console.error = function (...args) {
  const errorMessage = args[0]?.toString() || '';
  const error = args.find(arg => arg instanceof Error || (typeof arg === 'object' && arg !== null));

  // Silenciar errores de red y 503
  if (errorMessage.includes('503') ||
    errorMessage.includes('Service Unavailable') ||
    errorMessage.includes('Failed to load resource') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('ERR_NETWORK')) {
    // No mostrar en consola
    return;
  }

  // Verificar si el error debe ser silenciado
  if (error && shouldSilenceError(error)) {
    // No mostrar en consola
    return;
  }

  // Mostrar error normal
  originalConsoleError.apply(console, args);
};

// Sobrescribir console.warn para WebSocket errors
const originalConsoleWarn = console.warn;
console.warn = function (...args) {
  const message = args[0]?.toString() || '';

  // Silenciar warnings de WebSocket
  if (message.includes('WebSocket connection failed') ||
    message.includes('failed to connect to websocket') ||
    message.includes('[vite] failed to connect to websocket')) {
    // No mostrar en consola
    return;
  }

  originalConsoleWarn.apply(console, args);
};

// Interceptar eventos de error de red
window.addEventListener('error', (event) => {
  const message = event.message?.toLowerCase() || '';
  const source = event.filename || '';

  // Silenciar errores 503 y de conexión
  if (message.includes('503') ||
    message.includes('service unavailable') ||
    message.includes('failed to load resource') ||
    source.includes('AuthContext')) {
    event.preventDefault();
    return false;
  }
}, true);

// Interceptar errores no capturados de Promise
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const message = reason?.message?.toLowerCase() || '';
  const status = reason?.response?.status;

  // Silenciar errores 503 y de conexión
  if (status === 503 ||
    message.includes('503') ||
    message.includes('service unavailable') ||
    message.includes('econnrefused') ||
    message.includes('err_network')) {
    event.preventDefault();
    return false;
  }
});

