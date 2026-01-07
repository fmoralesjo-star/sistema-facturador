
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPhotoFieldsToUsuario1767647000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns("usuarios", [
            new TableColumn({
                name: "foto_cedula_anverso",
                type: "text",
                isNullable: true
            }),
            new TableColumn({
                name: "foto_cedula_reverso",
                type: "text",
                isNullable: true
            })
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns("usuarios", [
            "foto_cedula_anverso",
            "foto_cedula_reverso"
        ]);
    }

}
