import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateChequesTable1767414253971 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
