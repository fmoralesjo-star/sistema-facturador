import { Repository } from 'typeorm';
import { EmailLog } from './entities/email-log.entity';
import { Configuracion } from './entities/configuracion.entity';
export declare class EmailService {
    private emailLogRepository;
    private configuracionRepository;
    constructor(emailLogRepository: Repository<EmailLog>, configuracionRepository: Repository<Configuracion>);
    private getTransporter;
    enviarCorreo(to: string, subject: string, html: string, attachments?: any[]): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    obtenerLogs(limit?: number): Promise<EmailLog[]>;
    reintentar(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
