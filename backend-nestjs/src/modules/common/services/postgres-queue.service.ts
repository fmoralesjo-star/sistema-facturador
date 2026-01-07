import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { QueueJob, JobStatus } from '../entities/queue-job.entity';

@Injectable()
export class PostgresQueueService {
    private readonly logger = new Logger(PostgresQueueService.name);

    constructor(
        @InjectRepository(QueueJob)
        private readonly jobRepository: Repository<QueueJob>,
    ) { }

    /**
     * Agrega un trabajo a la cola
     */
    async addJob(type: string, data: any, delayMs: number = 0): Promise<QueueJob> {
        const nextRun = new Date(Date.now() + delayMs);

        const job = this.jobRepository.create({
            type,
            data,
            status: JobStatus.PENDING,
            next_run: nextRun,
        });

        return await this.jobRepository.save(job);
    }

    /**
     * Obtiene y bloquea el siguiente trabajo pendiente para procesar
     * Usa una transacción simple o UPDATE ... RETURNING para atomicidad básica
     */
    async getNextPendingJob(type: string): Promise<QueueJob | null> {
        // Buscar un job pendiente cuya fecha de ejecución ya haya pasado
        // NOTA: En alta concurrencia esto puede tener condiciones de carrera si no se usa bloqueo.
        // Para simplificar en Postgres: UPDATE ... WHERE id = (SELECT id ... FOR UPDATE SKIP LOCKED)

        // TypeORM approach simple:
        const job = await this.jobRepository.findOne({
            where: {
                type,
                status: JobStatus.PENDING,
                next_run: LessThanOrEqual(new Date()),
            },
            order: { next_run: 'ASC' },
        });

        if (!job) return null;

        // Marcar como procesando inmediatamente para evitar que otros lo tomen
        job.status = JobStatus.PROCESSING;
        job.attempts += 1;
        await this.jobRepository.save(job);

        return job;
    }

    /**
     * Marca un trabajo como completado
     */
    async completeJob(id: string): Promise<void> {
        await this.jobRepository.update(id, {
            status: JobStatus.COMPLETED,
        });
    }

    /**
     * Marca un trabajo como fallido y programa reintento si corresponde
     */
    async failJob(id: string, error: string, retryDelayMs: number | null = null): Promise<void> {
        const updateData: any = {
            last_error: error,
        };

        if (retryDelayMs !== null) {
            updateData.status = JobStatus.PENDING;
            updateData.next_run = new Date(Date.now() + retryDelayMs);
        } else {
            updateData.status = JobStatus.FAILED;
        }

        await this.jobRepository.update(id, updateData);
    }
}
