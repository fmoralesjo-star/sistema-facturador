import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuracion } from '../../admin/entities/configuracion.entity';

@Injectable()
export class CircuitBreakerService {
    private readonly logger = new Logger(CircuitBreakerService.name);
    private failureCount = 0;
    private readonly FAILURE_THRESHOLD = 5;
    private readonly RESET_TIMEOUT = 300000; // 5 minutos sin errores resetean el contador (opcional)
    private lastFailureTime: number = 0;

    constructor(
        @InjectRepository(Configuracion)
        private readonly configuracionRepository: Repository<Configuracion>,
    ) { }

    async registrarFallo(error: any): Promise<void> {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        this.logger.warn(`Circuit Breaker: Fallo detectado. Contador: ${this.failureCount}/${this.FAILURE_THRESHOLD}`);

        if (this.failureCount >= this.FAILURE_THRESHOLD) {
            await this.activarContingencia();
        }
    }

    async registrarExito(): Promise<void> {
        if (this.failureCount > 0) {
            this.logger.log('Circuit Breaker: Éxito detectado. Reseteando contador de fallos.');
            this.failureCount = 0;
        }

        // Opcional: Si el modo contingencia estaba activo y tenemos éxito, ¿desactivarlo?
        // Generalmente es mejor que la desactivación sea manual o tras un periodo de prueba, 
        // para evitar "flapping" (enciende/apaga constante).
        // Por ahora, solo reseteamos el contador de fallos para no volver a disparar la alerta inmediatamente.
    }

    private async activarContingencia() {
        this.logger.error('🚨 UMBRAL DE FALLOS SUPERADO. ACTIVANDO MODO CONTINGENCIA AUTOMÁTICO 🚨');

        try {
            // 1. Actualizar Configuración en BD
            let config = await this.configuracionRepository.findOne({
                where: { clave: 'sri_modo_contingencia' }
            });

            if (!config) {
                config = this.configuracionRepository.create({
                    clave: 'sri_modo_contingencia',
                    grupo: 'EMISION',
                    tipo: 'boolean',
                    descripcion: 'Modo Contingencia SRI (Activado Automáticamente)'
                });
            }

            // Si ya estaba activo, no hacemos nada (evitar spam de alertas)
            if (config.valor === 'true') {
                return;
            }

            config.valor = 'true';
            await this.configuracionRepository.save(config);

            // 2. Aquí se podría enviar un email al admin
            // await this.notificationService.sendAlert(...);
            this.logger.warn('Modo contingencia persistido en base de datos.');

        } catch (error) {
            this.logger.error('Error al intentar activar contingencia en BD:', error);
        }
    }

    async isContingenciaActiva(): Promise<boolean> {
        try {
            // Check rápido en memoria si quisiéramos cachear, pero consultamos BD para estar sync.
            // Para optimizar, podríamos cachear este valor por unos segundos.
            const config = await this.configuracionRepository.findOne({
                where: { clave: 'sri_modo_contingencia' }
            });
            return config?.valor === 'true';
        } catch (error) {
            return false;
        }
    }
}
