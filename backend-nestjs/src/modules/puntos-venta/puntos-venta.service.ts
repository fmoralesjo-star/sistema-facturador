import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePuntoVentaDto } from './dto/create-punto-venta.dto';
import { UpdatePuntoVentaDto } from './dto/update-punto-venta.dto';
import { PuntoVenta } from './entities/punto-venta.entity';

@Injectable()
export class PuntosVentaService {
    constructor(
        @InjectRepository(PuntoVenta)
        private readonly puntoVentaRepository: Repository<PuntoVenta>,
    ) { }

    async create(createDto: CreatePuntoVentaDto) {
        // Verificar si ya existe el código
        const existing = await this.puntoVentaRepository.findOne({
            where: { codigo: createDto.codigo }
        });

        if (existing) {
            if (existing.activo) {
                throw new ConflictException(`El código ${createDto.codigo} ya está en uso por otro punto de venta activo.`);
            } else {
                // Existe pero está inactivo. Lo reactivamos.
                Object.assign(existing, createDto);
                existing.activo = true;
                return await this.puntoVentaRepository.save(existing);
            }
        }

        const puntoVenta = this.puntoVentaRepository.create(createDto);
        return await this.puntoVentaRepository.save(puntoVenta);
    }

    async findAll() {
        try {
            return await this.puntoVentaRepository.find({
                order: { nombre: 'ASC' },
                where: { activo: true },
                relations: ['establecimiento']
            });
        } catch (error) {
            console.error('Error en findAll puntos de venta:', error);
            // Fallback sin relaciones si hay error
            return await this.puntoVentaRepository.find({
                order: { nombre: 'ASC' },
                where: { activo: true }
            });
        }
    }

    async findOne(id: number) {
        const puntoVenta = await this.puntoVentaRepository.findOne({
            where: { id },
            relations: ['establecimiento']
        });
        if (!puntoVenta) {
            throw new NotFoundException(`Punto de Venta con ID ${id} no encontrado`);
        }
        return puntoVenta;
    }

    async update(id: number, updateDto: UpdatePuntoVentaDto) {
        const puntoVenta = await this.findOne(id);
        Object.assign(puntoVenta, updateDto);
        return await this.puntoVentaRepository.save(puntoVenta);
    }

    async remove(id: number) {
        const puntoVenta = await this.findOne(id);
        // Soft delete
        puntoVenta.activo = false;
        return await this.puntoVentaRepository.save(puntoVenta);
    }
}
