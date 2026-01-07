
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { EmailLog } from './entities/email-log.entity';
import { Configuracion } from './entities/configuracion.entity';

@Injectable()
export class EmailService {
    constructor(
        @InjectRepository(EmailLog)
        private emailLogRepository: Repository<EmailLog>,
        @InjectRepository(Configuracion)
        private configuracionRepository: Repository<Configuracion>,
    ) { }

    private async getTransporter() {
        // Leer configuración fresca de la BD
        const configs = await this.configuracionRepository.find();
        const configMap = new Map(configs.map(c => [c.clave, c.valor]));

        const host = configMap.get('smtp_host');
        const port = Number(configMap.get('smtp_port')) || 587;
        const user = configMap.get('smtp_user');
        const pass = configMap.get('smtp_password');
        const secure = configMap.get('smtp_secure') === 'true';

        if (!host || !user || !pass) {
            throw new Error('Configuración SMTP incompleta');
        }

        return nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
            tls: { rejectUnauthorized: false }
        });
    }

    async enviarCorreo(to: string, subject: string, html: string, attachments: any[] = []) {
        // 1. Crear Log PENDIENTE
        const log = this.emailLogRepository.create({
            destinatario: to,
            asunto: subject,
            estado: 'PENDIENTE'
        });
        const savedLog = await this.emailLogRepository.save(log);

        try {
            const transporter = await this.getTransporter();
            const configFromName = (await this.configuracionRepository.findOne({ where: { clave: 'smtp_from_name' } }))?.valor || 'Sistema Facturador';

            // 2. Enviar
            await transporter.sendMail({
                from: `"${configFromName}" <${(transporter.options as any).auth.user}>`,
                to,
                subject,
                html,
                attachments
            });

            // 3. Actualizar Log EXITO
            savedLog.estado = 'ENVIADO';
            savedLog.fecha_envio = new Date();
            savedLog.error_detalle = null;
            await this.emailLogRepository.save(savedLog);

            return { success: true };
        } catch (error) {
            // 4. Actualizar Log ERROR
            savedLog.estado = 'ERROR';
            savedLog.error_detalle = error.message;
            await this.emailLogRepository.save(savedLog);
            console.error('Error enviando correo:', error);
            return { success: false, error: error.message };
        }
    }

    async obtenerLogs(limit = 50) {
        return this.emailLogRepository.find({
            take: limit,
            order: { fecha_creacion: 'DESC' }
        });
    }

    async reintentar(id: number) {
        const log = await this.emailLogRepository.findOne({ where: { id } });
        if (!log) throw new Error('Log no encontrado');

        // Reintentamos (el contenido cuerpo no lo guardamos por espacio, así que esto es solo para registros fallidos recientes en memoria o si cambiáramos la lógica)
        // NOTA: Como no guardamos el body (html) en el log para ahorrar espacio, no podemos reintentar "de verdad" solo con el ID sin volver a generar el contenido.
        // Por ahora, marcaremos como PENDIENTE para que un proceso externo (o el usuario manualmente generando el PDF de nuevo) lo intente.

        // CORRECCIÓN: Para que sea útil, vamos a permitir reintentar solo si implementamos lógica de regeneración. 
        // Por simplicidad en esta iteración, vamos a asumir que el usuario reenviará desde la factura original.
        // Este método solo servirá para actualizar el estado visual si se arregla manualmente.

        return { success: false, message: 'Reintento automático requiere regenerar el documento. Por favor reenvíe desde la factura.' };
    }
}
