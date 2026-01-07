"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PostgresQueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresQueueService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const queue_job_entity_1 = require("../entities/queue-job.entity");
let PostgresQueueService = PostgresQueueService_1 = class PostgresQueueService {
    constructor(jobRepository) {
        this.jobRepository = jobRepository;
        this.logger = new common_1.Logger(PostgresQueueService_1.name);
    }
    async addJob(type, data, delayMs = 0) {
        const nextRun = new Date(Date.now() + delayMs);
        const job = this.jobRepository.create({
            type,
            data,
            status: queue_job_entity_1.JobStatus.PENDING,
            next_run: nextRun,
        });
        return await this.jobRepository.save(job);
    }
    async getNextPendingJob(type) {
        const job = await this.jobRepository.findOne({
            where: {
                type,
                status: queue_job_entity_1.JobStatus.PENDING,
                next_run: (0, typeorm_2.LessThanOrEqual)(new Date()),
            },
            order: { next_run: 'ASC' },
        });
        if (!job)
            return null;
        job.status = queue_job_entity_1.JobStatus.PROCESSING;
        job.attempts += 1;
        await this.jobRepository.save(job);
        return job;
    }
    async completeJob(id) {
        await this.jobRepository.update(id, {
            status: queue_job_entity_1.JobStatus.COMPLETED,
        });
    }
    async failJob(id, error, retryDelayMs = null) {
        const updateData = {
            last_error: error,
        };
        if (retryDelayMs !== null) {
            updateData.status = queue_job_entity_1.JobStatus.PENDING;
            updateData.next_run = new Date(Date.now() + retryDelayMs);
        }
        else {
            updateData.status = queue_job_entity_1.JobStatus.FAILED;
        }
        await this.jobRepository.update(id, updateData);
    }
};
exports.PostgresQueueService = PostgresQueueService;
exports.PostgresQueueService = PostgresQueueService = PostgresQueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(queue_job_entity_1.QueueJob)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PostgresQueueService);
//# sourceMappingURL=postgres-queue.service.js.map