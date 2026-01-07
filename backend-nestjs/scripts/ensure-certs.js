const fs = require('fs');
const path = require('path');

const certsDir = path.join(__dirname, '..', 'certs');

if (!fs.existsSync(certsDir)) {
    console.log('📁 Creando directorio de certificados...');
    fs.mkdirSync(certsDir, { recursive: true });
    console.log('✅ Directorio created en:', certsDir);
} else {
    console.log('✅ El directorio de certificados ya existe.');
}
