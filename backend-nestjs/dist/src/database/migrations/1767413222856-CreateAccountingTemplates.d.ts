import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateAccountingTemplates1767413222856 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
