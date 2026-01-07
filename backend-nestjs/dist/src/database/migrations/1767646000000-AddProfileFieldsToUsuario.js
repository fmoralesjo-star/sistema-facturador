"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddProfileFieldsToUsuario1767646000000 = void 0;
const typeorm_1 = require("typeorm");
class AddProfileFieldsToUsuario1767646000000 {
    async up(queryRunner) {
        await queryRunner.addColumns("usuarios", [
            new typeorm_1.TableColumn({
                name: "identificacion",
                type: "varchar",
                length: "20",
                isNullable: true
            }),
            new typeorm_1.TableColumn({
                name: "telefono",
                type: "varchar",
                length: "20",
                isNullable: true
            }),
            new typeorm_1.TableColumn({
                name: "direccion",
                type: "text",
                isNullable: true
            }),
            new typeorm_1.TableColumn({
                name: "fecha_nacimiento",
                type: "date",
                isNullable: true
            }),
            new typeorm_1.TableColumn({
                name: "fecha_ingreso",
                type: "date",
                isNullable: true
            }),
            new typeorm_1.TableColumn({
                name: "sueldo",
                type: "decimal",
                precision: 10,
                scale: 2,
                default: 460.00,
                isNullable: true
            })
        ]);
    }
    async down(queryRunner) {
        await queryRunner.dropColumns("usuarios", [
            "identificacion",
            "telefono",
            "direccion",
            "fecha_nacimiento",
            "fecha_ingreso",
            "sueldo"
        ]);
    }
}
exports.AddProfileFieldsToUsuario1767646000000 = AddProfileFieldsToUsuario1767646000000;
//# sourceMappingURL=1767646000000-AddProfileFieldsToUsuario.js.map