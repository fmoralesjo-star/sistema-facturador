import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddRetentionToCompra1767414028572 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
