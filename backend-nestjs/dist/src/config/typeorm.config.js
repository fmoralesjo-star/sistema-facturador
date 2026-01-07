"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
(0, dotenv_1.config)();
exports.default = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USER || 'facturador',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'facturador_db',
    entities: [(0, path_1.join)(__dirname, '..', 'modules', '**', 'entities', '*.entity.{ts,js}')],
    migrations: [(0, path_1.join)(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
    synchronize: false,
    logging: true,
});
//# sourceMappingURL=typeorm.config.js.map