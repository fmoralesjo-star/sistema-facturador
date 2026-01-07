"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateQueueJobsTable1767618612663 = void 0;
class CreateQueueJobsTable1767618612663 {
    constructor() {
        this.name = 'CreateQueueJobsTable1767618612663';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."queue_jobs_status_enum" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "queue_jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "data" jsonb NOT NULL, "status" "public"."queue_jobs_status_enum" NOT NULL DEFAULT 'PENDING', "attempts" integer NOT NULL DEFAULT '0', "last_error" text, "next_run" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_queue_jobs_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "stored_files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "filename" character varying NOT NULL, "mime_type" character varying NOT NULL, "data" bytea NOT NULL, "size" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_stored_files_id" PRIMARY KEY ("id"))`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "stored_files"`);
        await queryRunner.query(`DROP TABLE "queue_jobs"`);
        await queryRunner.query(`DROP TYPE "public"."queue_jobs_status_enum"`);
    }
}
exports.CreateQueueJobsTable1767618612663 = CreateQueueJobsTable1767618612663;
//# sourceMappingURL=1767618612663-CreateQueueJobsTable.js.map