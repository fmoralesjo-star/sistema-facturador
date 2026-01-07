import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateBankExtractsTable1767414316216 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
