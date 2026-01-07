import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { LiquidacionCompra } from '../entities/liquidacion-compra.entity';
import { CreateLiquidacionDto } from '../dto/create-liquidacion.dto';

@Injectable()
export class LiquidacionesService {
    private readonly logger = new Logger(LiquidacionesService.name);

    constructor(
        @InjectRepository(LiquidacionCompra)
        private liquidacionRepository: Repository<LiquidacionCompra>,
    ) { }

    /**
     * Crear nueva liquidación de compra
     */
    async create(createDto: CreateLiquidacionDto): Promise<LiquidacionCompra> {
        try {
            // Obtener siguiente secuencial
            const secuencial = await this.obtenerSiguienteSecuencial();

            const liquidacion = this.liquidacionRepository.create({
                ...createDto,
                secuencial,
                estado: 'PENDIENTE',
            });

            const liquidacionGuardada = await this.liquidacionRepository.save(liquidacion);

            // TODO: Generar XML y autorizar con SRI (implementar después)
            this.logger.log(`Liquidación creada: ${liquidacionGuardada.id}`);

            return liquidacionGuardada;
        } catch (error) {
            this.logger.error('Error al crear liquidación', error);
            throw error;
        }
    }

    /**
     * Listar liquidaciones con filtros
     */
    async findAll(filtros?: {
        desde?: Date;
        hasta?: Date;
        estado?: string;
    }): Promise<LiquidacionCompra[]> {
        const query = this.liquidacionRepository.createQueryBuilder('liquidacion');

        if (filtros?.desde && filtros?.hasta) {
            query.andWhere('liquidacion.fecha_emision BETWEEN :desde AND :hasta', {
                desde: filtros.desde,
                hasta: filtros.hasta,
            });
        }

        if (filtros?.estado) {
            query.andWhere('liquidacion.estado = :estado', { estado: filtros.estado });
        }

        query.orderBy('liquidacion.fecha_emision', 'DESC');

        return await query.getMany();
    }

    /**
     * Obtener una liquidación por ID
     */
    async findOne(id: number): Promise<LiquidacionCompra> {
        const liquidacion = await this.liquidacionRepository.findOne({ where: { id } });

        if (!liquidacion) {
            throw new NotFoundException(`Liquidación con ID ${id} no encontrada`);
        }

        return liquidacion;
    }

    /**
     * Anular liquidación
     */
    async anular(id: number): Promise<LiquidacionCompra> {
        const liquidacion = await this.findOne(id);

        if (liquidacion.estado === 'ANULADA') {
            throw new Error('La liquidación ya está anulada');
        }

        liquidacion.estado = 'ANULADA';
        await this.liquidacionRepository.save(liquidacion);

        this.logger.log(`Liquidación ${id} anulada`);
        return liquidacion;
    }

    /**
     * Obtener siguiente secuencial
     */
    private async obtenerSiguienteSecuencial(): Promise<string> {
        const ultima = await this.liquidacionRepository
            .createQueryBuilder('liquidacion')
            .orderBy('liquidacion.id', 'DESC')
            .getOne();

        if (!ultima) {
            return '000000001';
        }

        const siguienteNumero = parseInt(ultima.secuencial) + 1;
        return siguienteNumero.toString().padStart(9, '0');
    }
}
