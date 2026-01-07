import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Proforma } from './entities/proforma.entity';
import { ProformaDetalle } from './entities/proforma-detalle.entity';
// import { CreateProformaDto } from './dto/create-proforma.dto';

@Injectable()
export class ProformasService {
    constructor(
        @InjectRepository(Proforma)
        private proformasRepository: Repository<Proforma>,
        @InjectRepository(ProformaDetalle)
        private detallesRepository: Repository<ProformaDetalle>,
    ) { }

    async create(createProformaDto: any) {
        // Generar número secuencial simple: PROF-0001
        const lastProforma = await this.proformasRepository.find({
            order: { id: 'DESC' },
            take: 1
        });

        let nextNum = 1;
        if (lastProforma.length > 0) {
            const lastNumStr = lastProforma[0].numero.split('-')[1];
            if (lastNumStr && !isNaN(parseInt(lastNumStr))) {
                nextNum = parseInt(lastNumStr) + 1;
            }
        }

        const numero = `PROF-${nextNum.toString().padStart(6, '0')}`;

        const proforma = this.proformasRepository.create({
            ...createProformaDto,
            numero,
            detalles: createProformaDto.detalles.map(d => this.detallesRepository.create(d))
        });

        return await this.proformasRepository.save(proforma);
    }

    async findAll(query: any) {
        const { fechaInicio, fechaFin, cliente, numero } = query;
        const where: any = {};

        if (fechaInicio && fechaFin) {
            where.fecha = Between(fechaInicio, fechaFin);
        }

        if (numero) {
            where.numero = Like(`%${numero}%`);
        }

        // Nota: Búsqueda por cliente requeriría Join o búsqueda en campos texto.
        // Simplificamos por ahora.

        return await this.proformasRepository.find({
            where,
            order: { id: 'DESC' },
            relations: ['detalles', 'cliente']
        });
    }

    async findOne(id: number) {
        const proforma = await this.proformasRepository.findOne({
            where: { id },
            relations: ['detalles', 'cliente']
        });
        if (!proforma) throw new NotFoundException(`Proforma #${id} not found`);
        return proforma;
    }
}
