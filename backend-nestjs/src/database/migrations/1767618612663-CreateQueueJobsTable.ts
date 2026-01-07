import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateQueueJobsTable1767618612663 implements MigrationInterface {
    name = 'CreateQueueJobsTable1767618612663'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Queue Jobs Table
        await queryRunner.query(`CREATE TYPE "public"."queue_jobs_status_enum" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "queue_jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "data" jsonb NOT NULL, "status" "public"."queue_jobs_status_enum" NOT NULL DEFAULT 'PENDING', "attempts" integer NOT NULL DEFAULT '0', "last_error" text, "next_run" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_queue_jobs_id" PRIMARY KEY ("id"))`);

        // Create Stored Files Table
        await queryRunner.query(`CREATE TABLE "stored_files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "filename" character varying NOT NULL, "mime_type" character varying NOT NULL, "data" bytea NOT NULL, "size" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_stored_files_id" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "stored_files"`);
        await queryRunner.query(`DROP TABLE "queue_jobs"`);
        await queryRunner.query(`DROP TYPE "public"."queue_jobs_status_enum"`);
    }

}
