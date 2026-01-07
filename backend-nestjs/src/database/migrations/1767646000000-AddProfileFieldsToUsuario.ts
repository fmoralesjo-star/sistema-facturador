
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddProfileFieldsToUsuario1767646000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns("usuarios", [
            new TableColumn({
                name: "identificacion",
                type: "varchar",
                length: "20",
                isNullable: true
            }),
            new TableColumn({
                name: "telefono",
                type: "varchar",
                length: "20",
                isNullable: true
            }),
            new TableColumn({
                name: "direccion",
                type: "text",
                isNullable: true
            }),
            new TableColumn({
                name: "fecha_nacimiento",
                type: "date",
                isNullable: true
            }),
            new TableColumn({
                name: "fecha_ingreso",
                type: "date",
                isNullable: true
            }),
            new TableColumn({
                name: "sueldo",
                type: "decimal",
                precision: 10,
                scale: 2,
                default: 460.00,
                isNullable: true
            })
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
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
