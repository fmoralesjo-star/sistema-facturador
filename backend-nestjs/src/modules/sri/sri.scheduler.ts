import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from '../empresa/entities/empresa.entity';
import { FirmaElectronicaService } from './services/firma-electronica.service';
import { IntegracionService } from '../integracion/integracion.service';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class SriScheduler {
    private readonly logger = new Logger(SriScheduler.name);

    constructor(
        @InjectRepository(Empresa) private empresaRepository: Repository<Empresa>,
        private firmaService: FirmaElectronicaService,
        private integracionService: IntegracionService,
        private configService: ConfigService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async verificarVencimientoCertificados() {
        this.logger.log('Iniciando verificación diaria de vencimiento de firmas electrónicas...');

        const empresas = await this.empresaRepository.find({ where: { activa: true } });

        for (const empresa of empresas) {
            try {
                if (!empresa.ruc) continue;

                // 1. Obtener certificado del usuario/empresa
                // Asumimos path estándar o buscamos en vault
                const certDir = this.configService.get('SRI_CERTIFICADO_PATH', './certs');
                const p12Path = path.join(certDir, `certificado-${empresa.ruc}.p12`);

                if (!fs.existsSync(p12Path)) {
                    // Si no hay certificado específico, skip
                    continue;
                }

                // 2. Obtener password
                const passwordEnc = await this.firmaService.obtenerPasswordEncriptada(empresa.ruc);
                if (!passwordEnc) continue;

                const password = await this.firmaService.desencriptarPassword(passwordEnc);

                // 3. Leer info del certificado
                const info = await this.firmaService.cargarCertificadoP12(p12Path, password, empresa.ruc);

                // 4. Calcular días restantes
                const now = new Date();
                const diffTime = info.fechaVencimiento.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // 5. Evaluar alertas
                if (diffDays <= 30 && diffDays > 0) {
                    this.logger.warn(`Certificado de ${empresa.razon_social} (RUC: ${empresa.ruc}) vence en ${diffDays} días.`);

                    // Enviar alerta a n8n
                    await this.integracionService.enviarEventoN8n('alerta_vencimiento_firma', {
                        tenant_id: empresa.id, // Ojo: tenant_id es empresa.id si mapeamos 1:1, o empresa_id de la columna
                        ruc: empresa.ruc,
                        razon_social: empresa.razon_social,
                        dias_restantes: diffDays,
                        fecha_vencimiento: info.fechaVencimiento.toISOString()
                    });
                } else if (diffDays <= 0) {
                    this.logger.error(`Certificado de ${empresa.razon_social} (RUC: ${empresa.ruc}) HA VENCIDO.`);
                    await this.integracionService.enviarEventoN8n('alerta_firma_vencida', {
                        tenant_id: empresa.id,
                        ruc: empresa.ruc,
                        razon_social: empresa.razon_social,
                        fecha_vencimiento: info.fechaVencimiento.toISOString()
                    });
                }

            } catch (error) {
                this.logger.error(`Error verificando firma para empresa ${empresa.razon_social}: ${error.message}`);
            }
        }
    }
}
