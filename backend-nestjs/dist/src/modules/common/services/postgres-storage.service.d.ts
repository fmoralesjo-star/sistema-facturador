import { Repository } from 'typeorm';
import { StoredFile } from '../entities/stored-file.entity';
export declare class PostgresStorageService {
    private readonly fileRepository;
    private readonly logger;
    constructor(fileRepository: Repository<StoredFile>);
    uploadFile(buffer: Buffer, filename: string, mimeType: string): Promise<string>;
    getFile(fileId: string): Promise<{
        buffer: Buffer;
        mimeType: string;
        filename: string;
    }>;
    deleteFile(fileId: string): Promise<void>;
}
