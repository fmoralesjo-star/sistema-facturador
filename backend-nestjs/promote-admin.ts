
import { DataSource } from "typeorm";
import { Usuario } from "./src/modules/usuarios/entities/usuario.entity";
import { config } from "dotenv";

config();

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DATABASE_HOST || "localhost",
    port: 5432,
    username: process.env.DATABASE_USER || "facturador",
    password: process.env.DATABASE_PASSWORD || "password",
    database: process.env.DATABASE_NAME || "facturador_db",
    entities: [Usuario],
    synchronize: false,
});

AppDataSource.initialize()
    .then(async () => {
        console.log("Database connected");
        const usuarioRepo = AppDataSource.getRepository(Usuario);
        const usuario = await usuarioRepo.findOne({ where: { email: "admin_test@test.com" } });

        if (usuario) {
            usuario.rol_id = 1; // 1 = Admin, 2 = Vendedor
            await usuarioRepo.save(usuario);
            console.log(`User ${usuario.email} promoted to Admin (rol_id: 1)`);
        } else {
            console.log("User not found");
        }
        process.exit(0);
    })
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    });
