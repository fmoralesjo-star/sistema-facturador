import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './utils/polyfills' // Cargar polyfills primero
import './utils/browserCompatibility' // Verificar compatibilidad
import './utils/suppressNetworkErrors' // Suprimir errores de red (cargar primero)
import './utils/silentErrors' // Filtrar errores esperados
import './index.css'

// Eliminar Service Workers automáticamente en desarrollo ANTES de renderizar
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    if (registrations.length > 0) {
      console.log(`🗑️ Eliminando ${registrations.length} Service Worker(s) en modo desarrollo...`)
      registrations.forEach((registration) => {
        registration.unregister().then((success) => {
          if (success) {
            console.log('✅ Service Worker eliminado:', registration.scope)
          }
        })
      })
      // Limpiar todos los caches
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName)
          })
          if (cacheNames.length > 0) {
            console.log(`✅ ${cacheNames.length} cache(s) eliminado(s)`)
          }
        })
      }
    }
  })
}

// ELIMINAR INMEDIATAMENTE el footer-banner con el texto del régimen - VERSIÓN ULTRA AGRESIVA MEJORADA
(function () {
  'use strict';

  const TEXTOS_PROHIBIDOS = [
    'CONTRIBUYENTE RÉGIMEN RIMPE - EMPRENDEDOR / AGENTE DE RETENCIÓN RES. No. 00001',
    'CONTRIBUYENTE RÉGIMEN RIMPE',
    'AGENTE DE RETENCIÓN RES',
    'EMPRENDEDOR / AGENTE',
    'RIMPE - EMPRENDEDOR',
    'RÉGIMEN RIMPE',
    'REGIMEN RIMPE',
    'RIMPE',
    'RES. No. 00001'
  ];

  const eliminarFooterBanner = () => {
    try {
      // 1. Buscar y eliminar por clase
      document.querySelectorAll('.footer-banner, [class*="footer-banner"], [class*="footer"][class*="banner"], [class*="rimpe"]').forEach(el => {
        try {
          el.remove();
        } catch (e) {
          el.style.cssText = 'display: none !important; visibility: hidden !important; height: 0 !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; opacity: 0 !important; position: absolute !important; left: -9999px !important; width: 0 !important; font-size: 0 !important; line-height: 0 !important;';
          el.innerHTML = '';
          el.textContent = '';
        }
      });

      // 2. Buscar nodos de texto directamente
      const walker = document.createTreeWalker(
        document.body || document.documentElement,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node;
      while (node = walker.nextNode()) {
        const texto = node.nodeValue || '';
        if (TEXTOS_PROHIBIDOS.some(t => texto.includes(t))) {
          node.nodeValue = '';
          if (node.parentElement) {
            const parent = node.parentElement;
            const parentText = (parent.textContent || '').trim();
            if (parentText.length < 200 || TEXTOS_PROHIBIDOS.some(t => parentText.includes(t))) {
              try {
                parent.remove();
              } catch (e) {
                parent.style.cssText = 'display: none !important; visibility: hidden !important; height: 0 !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; opacity: 0 !important; position: absolute !important; left: -9999px !important; width: 0 !important;';
                parent.innerHTML = '';
                parent.textContent = '';
              }
            }
          }
        }
      }

      // 3. Buscar TODOS los elementos
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'META' ||
          el.tagName === 'LINK' || el.tagName === 'HEAD' || el.tagName === 'HTML') return;

        const texto = (el.textContent || '').toUpperCase().trim();
        const innerHTML = (el.innerHTML || '').toUpperCase();

        if (TEXTOS_PROHIBIDOS.some(t => texto.includes(t.toUpperCase()) || innerHTML.includes(t.toUpperCase()))) {
          if (texto.length < 300 || el.className.includes('footer') || el.className.includes('banner') ||
            el.id.includes('footer') || el.id.includes('banner') || el.id.includes('rimpe')) {
            try {
              el.remove();
            } catch (e) {
              el.style.cssText = 'display: none !important; visibility: hidden !important; height: 0 !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; opacity: 0 !important; position: absolute !important; left: -9999px !important; width: 0 !important; font-size: 0 !important; line-height: 0 !important; pointer-events: none !important;';
              el.innerHTML = '';
              el.textContent = '';
              el.setAttribute('hidden', 'true');
              el.setAttribute('aria-hidden', 'true');
            }
          }
        }
      });
    } catch (e) {
      console.error('Error eliminando footer:', e);
    }
  };

  //   // Ejecutar INMEDIATAMENTE
  //   if (document.body) {
  //     eliminarFooterBanner();
  //   } else {
  //     document.addEventListener('DOMContentLoaded', eliminarFooterBanner);
  //   }

  //   // Ejecutar cuando la página cargue
  //   window.addEventListener('load', eliminarFooterBanner);

  //   // Ejecutar múltiples veces de forma más agresiva
  //   for (let i = 0; i < 200; i++) {
  //     setTimeout(eliminarFooterBanner, i * 10);
  //   }

  //   // También ejecutar cada 50ms durante 20 segundos
  //   const intervalId = setInterval(eliminarFooterBanner, 50);
  //   setTimeout(() => clearInterval(intervalId), 20000);

  //   // Observar cambios continuamente
  //   const observer = new MutationObserver(() => {
  //     eliminarFooterBanner();
  //   });

  //   if (document.body) {
  //     observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true });
  //   }
  //   if (document.documentElement) {
  //     observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  //   }

  //   // Ejecutar después de que React renderice
  //   setTimeout(eliminarFooterBanner, 100);
  //   setTimeout(eliminarFooterBanner, 500);
  //   setTimeout(eliminarFooterBanner, 1000);
  //   setTimeout(eliminarFooterBanner, 2000);
  //   setTimeout(eliminarFooterBanner, 3000);
  //   setTimeout(eliminarFooterBanner, 5000);

})()

// Ocultar loading cuando React cargue
try {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    console.error('No se encontró el elemento root')
  } else {
    const root = ReactDOM.createRoot(rootElement)

    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ErrorBoundary>
      </React.StrictMode>
    )

    // Ocultar loading después de renderizar
    setTimeout(() => {
      const loading = document.getElementById('loading')
      if (loading) {
        loading.style.opacity = '0'
        loading.style.transition = 'opacity 0.5s'
        setTimeout(() => {
          loading.style.display = 'none'
        }, 500)
      }
    }, 100)
  }
} catch (error) {
  console.error('Error al renderizar la aplicación:', error)
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial;">
      <h1>Error al cargar la aplicación</h1>
      <p>${error.message}</p>
      <p>Por favor, recarga la página o verifica la consola (F12) para más detalles.</p>
    </div>
  `
}

