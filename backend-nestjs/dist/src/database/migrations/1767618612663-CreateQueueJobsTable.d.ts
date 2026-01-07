import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateQueueJobsTable1767618612663 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
