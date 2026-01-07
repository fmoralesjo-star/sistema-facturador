// Script para eliminar el texto RIMPE - Ejecutar directamente en la consola del navegador
(function () {
  'use strict';

  const TEXTO_COMPLETO = 'CONTRIBUYENTE RÉGIMEN RIMPE - EMPRENDEDOR / AGENTE DE RETENCIÓN RES. No. 00001';
  const TEXTOS_PROHIBIDOS = [
    TEXTO_COMPLETO,
    'CONTRIBUYENTE RÉGIMEN RIMPE',
    'AGENTE DE RETENCIÓN RES',
    'EMPRENDEDOR / AGENTE',
    'RIMPE - EMPRENDEDOR',
    'RÉGIMEN RIMPE',
    'REGIMEN RIMPE',
    'RIMPE',
    'CONTRIBUYENTE',
    'RETENCIÓN',
    'RES. No. 00001'
  ];

  function eliminarTexto() {
    console.log('🔍 Buscando y eliminando texto RIMPE...');
    let eliminados = 0;

    const esElementoCritico = (el) => {
      return el === document.body ||
        el === document.documentElement ||
        el.id === 'root' ||
        el.tagName === 'HEAD' ||
        el.tagName === 'SCRIPT' ||
        el.tagName === 'STYLE' ||
        el.tagName === 'META' ||
        el.tagName === 'LINK';
    };

    try {
      // 1. Buscar por clase
      document.querySelectorAll('.footer-banner, [class*="footer-banner"], [class*="footer"][class*="banner"], [class*="rimpe"]').forEach(el => {
        if (esElementoCritico(el)) return;
        try {
          el.remove();
          eliminados++;
          console.log('✅ Eliminado por clase:', el);
        } catch (e) {
          el.style.display = 'none';
          eliminados++;
        }
      });

      // 2. Buscar nodos de texto
      const walker = document.createTreeWalker(
        document.body || document.documentElement,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function (node) {
            if (esElementoCritico(node.parentElement)) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        },
        false
      );

      let node;
      const nodosAEliminar = [];
      while (node = walker.nextNode()) {
        const texto = node.nodeValue || '';
        if (TEXTOS_PROHIBIDOS.some(t => texto.includes(t))) {
          nodosAEliminar.push(node);
        }
      }

      nodosAEliminar.forEach(node => {
        node.nodeValue = '';
        eliminados++;
        if (node.parentElement && !esElementoCritico(node.parentElement)) {
          const parent = node.parentElement;
          const parentText = (parent.textContent || '').trim();

          // Solo eliminar padre si es pequeño o explícitamente contiene solo el texto prohibido
          if (parentText.length < 300 && TEXTOS_PROHIBIDOS.some(t => parentText.includes(t))) {
            try {
              if (parent.querySelector('#root')) return; // Extra check
              parent.remove();
              eliminados++;
            } catch (e) {
              parent.style.display = 'none';
              eliminados++;
            }
          }
        }
      });

      // 3. Buscar TODOS los elementos
      document.querySelectorAll('*').forEach(el => {
        if (esElementoCritico(el)) return;

        // No procesar hijos directos del body si no son divs seguros
        if (el.parentElement === document.body && el.tagName !== 'DIV') return;

        const texto = (el.textContent || '').toUpperCase().trim();

        if (TEXTOS_PROHIBIDOS.some(t => texto.includes(t.toUpperCase()))) {
          if (texto.length < 300 || el.className.includes('footer') || el.className.includes('banner')) {
            // Verificar que no contenga elementos críticos
            if (el.querySelector('#root')) return;

            try {
              el.remove();
              eliminados++;
            } catch (e) {
              el.style.display = 'none';
              eliminados++;
            }
          }
        }
      });

      console.log(`✅ Proceso completado. ${eliminados} elemento(s) eliminado(s)/oculto(s).`);
      return eliminados;
    } catch (error) {
      console.error('❌ Error:', error);
      return 0;
    }
  }

  // Ejecutar inmediatamente
  let totalEliminados = eliminarTexto();

  // Ejecutar múltiples veces
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      totalEliminados += eliminarTexto();
    }, i * 20);
  }

  // Observar cambios
  const observer = new MutationObserver(() => {
    eliminarTexto();
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  console.log('✅ Script activado. El texto será eliminado automáticamente.');
  return totalEliminados;
})();


