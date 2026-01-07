// Gestor de conexión para manejar errores y reconexiones
import axios from 'axios';
import { API_URL } from '../config/api';

let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Interceptor de axios para manejar errores de conexión
axios.interceptors.response.use(
  (response) => {
    retryCount = 0; // Resetear contador en éxito
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // No mostrar errores 503 en consola si es un error de conexión esperado
    const isConnectionError = 
      error.response?.status === 503 ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('timeout') ||
      error.message?.includes('Network Error');

    // Si es un error de red y no hemos excedido los reintentos
    if (
      (!error.response || isConnectionError) &&
      !originalRequest._retry &&
      retryCount < MAX_RETRIES
    ) {
      retryCount++;
      originalRequest._retry = true;

      // Esperar antes de reintentar
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * retryCount));

      // NO hacer fallback a localhost en producción
      // Si estamos en producción y falla, simplemente fallar

      return axios(originalRequest);
    }

    // Marcar errores de conexión para que no se muestren en consola
    if (isConnectionError) {
      error.silent = true; // Marcar para no mostrar en consola
      error.userMessage = 'El servidor no está disponible. Verifica que el backend esté corriendo.';
    }

    return Promise.reject(error);
  }
);

// Interceptor de request para agregar timeout por defecto
axios.interceptors.request.use(
  (config) => {
    // Agregar timeout si no existe
    if (!config.timeout) {
      config.timeout = 10000; // 10 segundos por defecto
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Función para verificar conectividad
export async function checkConnection() {
  try {
    const response = await axios.get(`${API_URL.replace('/api', '')}/health`, {
      timeout: 5000,
    });
    return { connected: true, data: response.data };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

// Función para obtener la IP local del dispositivo
export function getLocalIP() {
  return new Promise((resolve) => {
    // Intentar obtener IP a través de WebRTC (si está disponible)
    const RTCPeerConnection = window.RTCPeerConnection || 
                              window.mozRTCPeerConnection || 
                              window.webkitRTCPeerConnection;
    
    if (!RTCPeerConnection) {
      resolve(null);
      return;
    }

    const pc = new RTCPeerConnection({ iceServers: [] });
    const ips = [];

    pc.createDataChannel('');
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candidate = event.candidate.candidate;
        const match = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
        if (match) {
          const ip = match[1];
          if (!ips.includes(ip) && !ip.startsWith('127.')) {
            ips.push(ip);
          }
        }
      } else {
        pc.close();
        resolve(ips[0] || null);
      }
    };

    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer))
      .catch(() => resolve(null));

    // Timeout después de 2 segundos
    setTimeout(() => {
      pc.close();
      resolve(ips[0] || null);
    }, 2000);
  });
}

