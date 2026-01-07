import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueJob } from './entities/queue-job.entity';
import { StoredFile } from './entities/stored-file.entity'; // Restore
import { PostgresQueueService } from './services/postgres-queue.service';
import { PostgresStorageService } from './services/postgres-storage.service'; // Restore

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([StoredFile, QueueJob]),
    ],
    providers: [PostgresStorageService, PostgresQueueService],
    exports: [PostgresStorageService, PostgresQueueService],
})
export class CommonModule { }
