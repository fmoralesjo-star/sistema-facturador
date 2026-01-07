"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const usuario_entity_1 = require("./src/modules/usuarios/entities/usuario.entity");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DATABASE_HOST || "localhost",
    port: 5432,
    username: process.env.DATABASE_USER || "facturador",
    password: process.env.DATABASE_PASSWORD || "password",
    database: process.env.DATABASE_NAME || "facturador_db",
    entities: [usuario_entity_1.Usuario],
    synchronize: false,
});
AppDataSource.initialize()
    .then(async () => {
    console.log("Database connected");
    const usuarioRepo = AppDataSource.getRepository(usuario_entity_1.Usuario);
    const usuario = await usuarioRepo.findOne({ where: { email: "admin_test@test.com" } });
    if (usuario) {
        usuario.rol_id = 1;
        await usuarioRepo.save(usuario);
        console.log(`User ${usuario.email} promoted to Admin (rol_id: 1)`);
    }
    else {
        console.log("User not found");
    }
    process.exit(0);
})
    .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
//# sourceMappingURL=promote-admin.js.map