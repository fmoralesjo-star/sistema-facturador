import { Repository } from 'typeorm';
import { QueueJob } from '../entities/queue-job.entity';
export declare class PostgresQueueService {
    private readonly jobRepository;
    private readonly logger;
    constructor(jobRepository: Repository<QueueJob>);
    addJob(type: string, data: any, delayMs?: number): Promise<QueueJob>;
    getNextPendingJob(type: string): Promise<QueueJob | null>;
    completeJob(id: string): Promise<void>;
    failJob(id: string, error: string, retryDelayMs?: number | null): Promise<void>;
}
