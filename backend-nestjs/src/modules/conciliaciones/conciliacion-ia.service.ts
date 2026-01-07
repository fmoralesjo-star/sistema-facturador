import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransaccionBancaria } from './entities/transaccion-bancaria.entity';
import { ConciliacionBancaria } from './entities/conciliacion-bancaria.entity';

export interface SugerenciaMatch {
    conciliacion: ConciliacionBancaria;
    score: number;
    razones: string[];
}

@Injectable()
export class ConciliacionIAService {
    private readonly logger = new Logger(ConciliacionIAService.name);

    constructor(
        @InjectRepository(TransaccionBancaria)
        private transaccionRepo: Repository<TransaccionBancaria>,
        @InjectRepository(ConciliacionBancaria)
        private conciliacionRepo: Repository<ConciliacionBancaria>,
    ) { }

    /**
     * Procesar archivo de extracto bancario
     */
    async procesarExtracto(data: any[], bancoId: number): Promise<TransaccionBancaria[]> {
        const transacciones = [];

        for (const row of data) {
            const transaccion = this.transaccionRepo.create({
                banco_id: bancoId,
                fecha: new Date(row.fecha),
                referencia: row.referencia || '',
                descripcion: row.descripcion || '',
                tipo: row.tipo || (row.monto > 0 ? 'CREDITO' : 'DEBITO'),
                monto: Math.abs(parseFloat(row.monto)),
                saldo: parseFloat(row.saldo || 0),
                estado: 'PENDIENTE',
            });

            const saved = await this.transaccionRepo.save(transaccion);
            transacciones.push(saved);
        }

        this.logger.log(`Procesadas ${transacciones.length} transacciones bancarias`);
        return transacciones;
    }

    /**
     * Obtener transacciones pendientes
     */
    async getPendientes(bancoId?: number): Promise<TransaccionBancaria[]> {
        const query: any = { estado: 'PENDIENTE' };
        if (bancoId) query.banco_id = bancoId;

        return await this.transaccionRepo.find({
            where: query,
            order: { fecha: 'DESC' }
        });
    }

    /**
     * Sugerir emparejamientos con IA
     */
    async sugerirEmparejamientos(transaccionId: number): Promise<SugerenciaMatch[]> {
        const transaccion = await this.transaccionRepo.findOne({ where: { id: transaccionId } });

        if (!transaccion) {
            throw new Error('Transacción no encontrada');
        }

        // Buscar candidatos de conciliaciones
        const candidatos = await this.buscarCandidatos(transaccion);

        // Aplicar algoritmo de matching
        const matches = this.calcularMatches(transaccion, candidatos);

        // Ordenar por score
        return matches.sort((a, b) => b.score - a.score);
    }

    /**
     * Buscar candidatos potenciales
     */
    private async buscarCandidatos(transaccion: TransaccionBancaria): Promise<ConciliacionBancaria[]> {
        // Buscar en ±7 días
        const fechaInicio = new Date(transaccion.fecha);
        fechaInicio.setDate(fechaInicio.getDate() - 7);

        const fechaFin = new Date(transaccion.fecha);
        fechaFin.setDate(fechaFin.getDate() + 7);

        return await this.conciliacionRepo
            .createQueryBuilder('c')
            .where('c.banco_id = :bancoId', { bancoId: transaccion.banco_id })
            .andWhere('c.fecha BETWEEN :inicio AND :fin', {
                inicio: fechaInicio,
                fin: fechaFin
            })
            .andWhere('c.conciliado = :conciliado', { conciliado: false })
            .getMany();
    }

    /**
     * Calcular matches con scoring
     */
    private calcularMatches(
        transaccion: TransaccionBancaria,
        candidatos: ConciliacionBancaria[]
    ): SugerenciaMatch[] {
        return candidatos.map(candidato => {
            let score = 0;
            const razones: string[] = [];

            // 1. Coincidencia de monto (40%)
            const diffMonto = Math.abs(candidato.monto - transaccion.monto);
            if (diffMonto < 0.01) {
                score += 0.4;
                razones.push('✓ Monto exacto');
            } else if (diffMonto / transaccion.monto < 0.01) {
                score += 0.3;
                razones.push('≈ Monto muy similar');
            } else if (diffMonto / transaccion.monto < 0.05) {
                score += 0.2;
                razones.push('~ Monto similar');
            }

            // 2. Proximidad de fecha (30%)
            const diffDias = Math.abs(
                (new Date(candidato.fecha).getTime() - new Date(transaccion.fecha).getTime())
                / (1000 * 60 * 60 * 24)
            );

            if (diffDias === 0) {
                score += 0.3;
                razones.push('✓ Misma fecha');
            } else if (diffDias === 1) {
                score += 0.25;
                razones.push('≈ 1 día de diferencia');
            } else if (diffDias <= 2) {
                score += 0.20;
                razones.push(`~ ${Math.round(diffDias)} días de diferencia`);
            } else if (diffDias <= 3) {
                score += 0.15;
                razones.push(`~ ${Math.round(diffDias)} días de diferencia`);
            }

            // 3. Similitud de descripción (30%)
            const similarity = this.calcularSimilitudTexto(
                transaccion.descripcion,
                candidato.descripcion || ''
            );

            if (similarity > 0.7) {
                score += 0.3;
                razones.push('✓ Descripción muy similar');
            } else if (similarity > 0.5) {
                score += 0.2;
                razones.push('≈ Descripción similar');
            } else if (similarity > 0.3) {
                score += 0.1;
                razones.push('~ Algo de coincidencia en descripción');
            }

            // 4. Tipo de transacción (bonus)
            if (candidato.tipo === transaccion.tipo) {
                score += 0.05;
                razones.push('✓ Mismo tipo de movimiento');
            }

            return {
                conciliacion: candidato,
                score,
                razones: razones.length > 0 ? razones : ['Sin coincidencias significativas']
            };
        }).filter(m => m.score > 0.2); // Filtrar matches muy débiles
    }

    /**
     * Similitud de texto simple
     */
    private calcularSimilitudTexto(str1: string, str2: string): number {
        const s1 = str1.toLowerCase();
        const s2 = str2.toLowerCase();

        // Dividir en palabras
        const palabras1 = s1.split(/\s+/).filter(p => p.length > 3);
        const palabras2 = s2.split(/\s+/).filter(p => p.length > 3);

        if (palabras1.length === 0 || palabras2.length === 0) {
            return 0;
        }

        // Contar palabras comunes
        const comunes = palabras1.filter(p => palabras2.includes(p)).length;
        const total = Math.max(palabras1.length, palabras2.length);

        return comunes / total;
    }

    /**
     * Confirmar emparejamiento
     */
    async confirmarEmparejamiento(
        transaccionId: number,
        conciliacionId: number
    ): Promise<TransaccionBancaria> {
        const transaccion = await this.transaccionRepo.findOne({ where: { id: transaccionId } });
        const conciliacion = await this.conciliacionRepo.findOne({ where: { id: conciliacionId } });

        if (!transaccion || !conciliacion) {
            throw new Error('Transacción o conciliación no encontrada');
        }

        // Actualizar transacción
        transaccion.estado = 'CONCILIADA';
        transaccion.conciliacion_id = conciliacionId;
        await this.transaccionRepo.save(transaccion);

        // Marcar conciliación como conciliada
        conciliacion.conciliado = true;
        await this.conciliacionRepo.save(conciliacion);

        this.logger.log(`Transacción ${transaccionId} emparejada con conciliación ${conciliacionId}`);
        return transaccion;
    }

    /**
     * Obtener estadísticas
     */
    async getEstadisticas(bancoId?: number) {
        const query: any = {};
        if (bancoId) query.banco_id = bancoId;

        const total = await this.transaccionRepo.count({ where: query });
        const pendientes = await this.transaccionRepo.count({
            where: { ...query, estado: 'PENDIENTE' }
        });
        const conciliadas = await this.transaccionRepo.count({
            where: { ...query, estado: 'CONCILIADA' }
        });

        return {
            total,
            pendientes,
            conciliadas,
            porcentajeConciliado: total > 0 ? (conciliadas / total * 100).toFixed(1) : 0
        };
    }
}
