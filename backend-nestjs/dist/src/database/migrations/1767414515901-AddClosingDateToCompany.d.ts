import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddClosingDateToCompany1767414515901 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
