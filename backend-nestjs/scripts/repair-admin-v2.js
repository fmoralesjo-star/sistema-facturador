const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('c:/Users/pc/SISTEMA FACTURADOR/client/src/pages/Admin.jsx');

function repair() {
    console.log(`Leyendo archivo: ${targetFile}`);
    let content = fs.readFileSync(targetFile, 'utf8');

    const repairs = [
        // Palabras comunes con tildes y eñes corruptas
        { pattern: /Ests seguro/g, replacement: '¿Estás seguro' },
        { pattern: /est seguro/g, replacement: 'está seguro' },
        { pattern: /Tamao/g, replacement: 'Tamaño' },
        { pattern: /Configuracin/g, replacement: 'Configuración' },
        { pattern: /configuracin/g, replacement: 'configuración' },
        { pattern: /Informacin/g, replacement: 'Información' },
        { pattern: /informacin/g, replacement: 'información' },
        { pattern: /Estadsticas/g, replacement: 'Estadísticas' },
        { pattern: /estáadsticas/g, replacement: 'estadísticas' },
        { pattern: /estáadstica/g, replacement: 'estadística' },
        { pattern: /estácorriendo/g, replacement: 'está corriendo' },
        { pattern: /estáatodo/g, replacement: 'está todo' },
        { pattern: /estático/g, replacement: 'estático' },
        { pattern: /estábien/g, replacement: 'está bien' },
        { pattern: /estãabien/g, replacement: 'está bien' },
        { pattern: /estãas/g, replacement: 'estas' },
        { pattern: /estã¡/g, replacement: 'está' },
        { pattern: /áºltimo/g, replacement: 'último' },
        { pattern: /ášltimo/g, replacement: 'último' },
        { pattern: /ašltimo/g, replacement: 'último' },
        { pattern: /íšltimo/g, replacement: 'último' },
        { pattern: /íšltima/g, replacement: 'última' },
        { pattern: /ášltima/g, replacement: 'última' },
        { pattern: /Bitácora/g, replacement: 'Bitácora' },
        { pattern: /Bitcora/g, replacement: 'Bitácora' },
        { pattern: /Bitâcoras/g, replacement: 'Bitácoras' },
        { pattern: /Auditoria/g, replacement: 'Auditoría' },
        { pattern: /Auditoría/g, replacement: 'Auditoría' },
        { pattern: /auditoria/g, replacement: 'auditoría' },
        { pattern: /auditoría/g, replacement: 'auditoría' },
        { pattern: /Gestin/g, replacement: 'Gestión' },
        { pattern: /gestin/g, replacement: 'gestión' },
        { pattern: /Gestã³n/g, replacement: 'Gestión' },
        { pattern: /gestã³n/g, replacement: 'gestión' },
        { pattern: /Mdulo/g, replacement: 'Módulo' },
        { pattern: /mdulo/g, replacement: 'módulo' },
        { pattern: /Accin/g, replacement: 'Acción' },
        { pattern: /accin/g, replacement: 'acción' },
        { pattern: /Versin/g, replacement: 'Versión' },
        { pattern: /Actualizacin/g, replacement: 'Actualización' },
        { pattern: /Restáauracin/g, replacement: 'Restauración' },
        { pattern: /restáauracin/g, replacement: 'restauración' },
        { pattern: /Respuesta/g, replacement: 'Respuesta' },
        { pattern: /respuestáa/g, replacement: 'respuesta' },
        { pattern: /Contrasea/g, replacement: 'Contraseña' },
        { pattern: /contrasea/g, replacement: 'contraseña' },
        { pattern: /Puntos de Venta/g, replacement: 'Puntos de Venta' },
        { pattern: /PuntosVenta/g, replacement: 'PuntosVenta' },
        { pattern: /están/g, replacement: 'están' },
        { pattern: /están/g, replacement: 'están' },
        { pattern: /están/g, replacement: 'están' },
        { pattern: /están/g, replacement: 'están' },

        // Emojis corruptos o desaparecidos
        { pattern: /âœ…/g, replacement: '✅' },
        { pattern: /âš ï¸ /g, replacement: '⚠️' },
        { pattern: /â Œ/g, replacement: '❌' },
        { pattern: /ðŸ”„/g, replacement: '🔄' },
        { pattern: /â “/g, replacement: '❓' },
        { pattern: /ï¿½/g, replacement: '' }, // Limpiar artefactos null
    ];

    let newContent = content;
    repairs.forEach(r => {
        newContent = newContent.replace(r.pattern, r.replacement);
    });

    if (newContent !== content) {
        fs.writeFileSync(targetFile, newContent, 'utf8');
        console.log('Reparación completada exitosamente.');
    } else {
        console.log('No se encontraron patrones para reparar o el archivo ya está limpio.');
    }
}

repair();
