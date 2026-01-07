// Utilidades para verificar compatibilidad del navegador

export function checkBrowserCompatibility() {
  const issues = [];
  const warnings = [];

  // Verificar características esenciales
  if (typeof Promise === 'undefined') {
    issues.push('Promise no está disponible. El navegador es demasiado antiguo.');
  }

  if (typeof fetch === 'undefined' && typeof XMLHttpRequest === 'undefined') {
    issues.push('No hay soporte para peticiones HTTP. El navegador es demasiado antiguo.');
  }

  if (typeof localStorage === 'undefined') {
    warnings.push('localStorage no está disponible. Algunas funciones pueden no funcionar.');
  }

  if (typeof sessionStorage === 'undefined') {
    warnings.push('sessionStorage no está disponible.');
  }

  // Verificar WebSocket (para Socket.io)
  if (typeof WebSocket === 'undefined') {
    warnings.push('WebSocket no está disponible. Socket.io usará polling como alternativa.');
  }

  // Verificar Service Worker (para PWA)
  if (!('serviceWorker' in navigator)) {
    warnings.push('Service Worker no está disponible. La funcionalidad PWA estará limitada.');
  }

  // Verificar IndexedDB (opcional)
  if (!window.indexedDB) {
    warnings.push('IndexedDB no está disponible.');
  }

  // Detectar navegador
  const userAgent = navigator.userAgent;
  let browser = 'Desconocido';
  let browserVersion = '';

  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : '';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : '';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : '';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
    const match = userAgent.match(/Edg\/(\d+)/);
    browserVersion = match ? match[1] : '';
  }

  return {
    browser,
    browserVersion,
    issues,
    warnings,
    compatible: issues.length === 0,
  };
}

// Función para mostrar advertencias de compatibilidad
export function showCompatibilityWarnings() {
  const compatibility = checkBrowserCompatibility();

  if (compatibility.issues.length > 0) {
    console.error('❌ Problemas de compatibilidad detectados:');
    compatibility.issues.forEach(issue => {
      console.error(`   - ${issue}`);
    });
  }

  if (compatibility.warnings.length > 0) {
    console.warn('⚠️  Advertencias de compatibilidad:');
    compatibility.warnings.forEach(warning => {
      console.warn(`   - ${warning}`);
    });
  }

  if (compatibility.compatible) {
    console.log(`✅ Navegador compatible: ${compatibility.browser} ${compatibility.browserVersion}`);
  }

  return compatibility;
}

// Verificar al cargar
if (typeof window !== 'undefined') {
  showCompatibilityWarnings();
}


