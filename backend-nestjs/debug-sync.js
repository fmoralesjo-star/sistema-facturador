
const axios = require('axios');

async function run() {
    try {
        console.log('Sending request for admin_real...');
        const res = await axios.post('http://127.0.0.1:3001/api/usuarios/sync-firebase', {
            firebase_uid: "admin_real_uid_" + Date.now(),
            email: "admin_real@test.com",
            nombre_completo: "Admin Real",
            identificacion: "2222222222",
            telefono: "0987654321",
            direccion: "Admin House",
            fecha_nacimiento: "1985-05-05",
            sueldo: 460,
            foto_cedula_anverso: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGNiAAAABgDNjd8YNAAAAABJRU5ErkJggg==",
            foto_cedula_reverso: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGNiAAAABgDNjd8YNAAAAABJRU5ErkJggg=="
        });
        console.log('Success:', res.data);
    } catch (error) {
        if (error.response) {
            console.error('Data:', error.response.data);
            console.error('Status:', error.response.status);
        } else {
            console.error('Error message:', error.message);
        }
    }
}

run();
