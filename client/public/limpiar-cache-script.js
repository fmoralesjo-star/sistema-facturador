// Script para limpiar cache y forzar actualización
(async () => {
  console.log('🧹 Iniciando limpieza de cache...');
  
  try {
    // 1. Limpiar todos los caches
    const cacheNames = await caches.keys();
    console.log('📦 Caches encontrados:', cacheNames);
    
    await Promise.all(
      cacheNames.map(name => {
        console.log('🗑️ Eliminando cache:', name);
        return caches.delete(name);
      })
    );
    console.log('✅ Todos los caches eliminados');
    
    // 2. Desregistrar todos los Service Workers
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log('👷 Service Workers encontrados:', registrations.length);
    
    await Promise.all(
      registrations.map(reg => {
        console.log('🗑️ Desregistrando SW:', reg.scope);
        return reg.unregister();
      })
    );
    console.log('✅ Todos los Service Workers desregistrados');
    
    // 3. Recargar página forzando actualización
    console.log('🔄 Recargando página...');
    setTimeout(() => {
      window.location.href = window.location.pathname + '?nocache=' + Date.now();
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Error al limpiar cache: ' + error.message);
  }
})();




