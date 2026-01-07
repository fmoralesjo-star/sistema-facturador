import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum JobStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

@Entity('queue_jobs')
export class QueueJob {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    type: string; // e.g., 'enviar-factura'

    @Column('jsonb')
    data: any;

    @Column({
        type: 'enum',
        enum: JobStatus,
        default: JobStatus.PENDING,
    })
    status: JobStatus;

    @Column({ default: 0 })
    attempts: number;

    @Column({ type: 'text', nullable: true })
    last_error: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    next_run: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
