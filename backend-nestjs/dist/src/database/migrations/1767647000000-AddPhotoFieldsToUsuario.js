"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPhotoFieldsToUsuario1767647000000 = void 0;
const typeorm_1 = require("typeorm");
class AddPhotoFieldsToUsuario1767647000000 {
    async up(queryRunner) {
        await queryRunner.addColumns("usuarios", [
            new typeorm_1.TableColumn({
                name: "foto_cedula_anverso",
                type: "text",
                isNullable: true
            }),
            new typeorm_1.TableColumn({
                name: "foto_cedula_reverso",
                type: "text",
                isNullable: true
            })
        ]);
    }
    async down(queryRunner) {
        await queryRunner.dropColumns("usuarios", [
            "foto_cedula_anverso",
            "foto_cedula_reverso"
        ]);
    }
}
exports.AddPhotoFieldsToUsuario1767647000000 = AddPhotoFieldsToUsuario1767647000000;
//# sourceMappingURL=1767647000000-AddPhotoFieldsToUsuario.js.map