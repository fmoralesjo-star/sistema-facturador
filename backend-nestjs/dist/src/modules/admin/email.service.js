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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const nodemailer = require("nodemailer");
const email_log_entity_1 = require("./entities/email-log.entity");
const configuracion_entity_1 = require("./entities/configuracion.entity");
let EmailService = class EmailService {
    constructor(emailLogRepository, configuracionRepository) {
        this.emailLogRepository = emailLogRepository;
        this.configuracionRepository = configuracionRepository;
    }
    async getTransporter() {
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
    async enviarCorreo(to, subject, html, attachments = []) {
        const log = this.emailLogRepository.create({
            destinatario: to,
            asunto: subject,
            estado: 'PENDIENTE'
        });
        const savedLog = await this.emailLogRepository.save(log);
        try {
            const transporter = await this.getTransporter();
            const configFromName = (await this.configuracionRepository.findOne({ where: { clave: 'smtp_from_name' } }))?.valor || 'Sistema Facturador';
            await transporter.sendMail({
                from: `"${configFromName}" <${transporter.options.auth.user}>`,
                to,
                subject,
                html,
                attachments
            });
            savedLog.estado = 'ENVIADO';
            savedLog.fecha_envio = new Date();
            savedLog.error_detalle = null;
            await this.emailLogRepository.save(savedLog);
            return { success: true };
        }
        catch (error) {
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
    async reintentar(id) {
        const log = await this.emailLogRepository.findOne({ where: { id } });
        if (!log)
            throw new Error('Log no encontrado');
        return { success: false, message: 'Reintento automático requiere regenerar el documento. Por favor reenvíe desde la factura.' };
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(email_log_entity_1.EmailLog)),
    __param(1, (0, typeorm_1.InjectRepository)(configuracion_entity_1.Configuracion)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], EmailService);
//# sourceMappingURL=email.service.js.map