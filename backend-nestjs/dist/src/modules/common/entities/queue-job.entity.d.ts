export declare enum JobStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare class QueueJob {
    id: string;
    type: string;
    data: any;
    status: JobStatus;
    attempts: number;
    last_error: string;
    next_run: Date;
    created_at: Date;
    updated_at: Date;
}
