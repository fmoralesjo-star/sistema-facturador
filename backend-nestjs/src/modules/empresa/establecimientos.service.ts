import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Establecimiento } from './entities/establecimiento.entity';

@Injectable()
export class EstablecimientosService {
    constructor(
        @InjectRepository(Establecimiento)
        private repo: Repository<Establecimiento>,
    ) { }

    async create(data: Partial<Establecimiento>) {
        if (!data.codigo || data.codigo.length !== 3) {
            throw new BadRequestException('El código debe tener 3 dígitos');
        }

        const existing = await this.repo.findOne({ where: { codigo: data.codigo } });
        if (existing) {
            throw new BadRequestException('Ya existe un establecimiento con este código');
        }

        const establecimiento = this.repo.create(data);
        return await this.repo.save(establecimiento);
    }

    async findAll() {
        return await this.repo.find({
            order: { codigo: 'ASC' },
            relations: ['puntosEmision']
        });
    }

    async findOne(id: number) {
        const est = await this.repo.findOne({
            where: { id },
            relations: ['puntosEmision']
        });
        if (!est) throw new NotFoundException('Establecimiento no encontrado');
        return est;
    }

    async update(id: number, data: Partial<Establecimiento>) {
        const est = await this.findOne(id);
        Object.assign(est, data);
        return await this.repo.save(est);
    }

    async remove(id: number) {
        const est = await this.findOne(id);
        est.activo = false;
        return await this.repo.save(est);
    }
}
