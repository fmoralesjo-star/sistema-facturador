import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImpuestoIVA } from './entities/impuesto-iva.entity';
import { RetencionSRI } from './entities/retencion-sri.entity';
import { SustentoTributario } from './entities/sustento-tributario.entity';

@Injectable()
export class ParametrosSriService {
    constructor(
        @InjectRepository(ImpuestoIVA)
        private ivaRepo: Repository<ImpuestoIVA>,
        @InjectRepository(RetencionSRI)
        private retencionRepo: Repository<RetencionSRI>,
        @InjectRepository(SustentoTributario)
        private sustentoRepo: Repository<SustentoTributario>,
    ) { }

    // --- IVA ---
    async findAllIva() {
        return await this.ivaRepo.find({ order: { codigo: 'ASC' } });
    }

    async createIva(data: Partial<ImpuestoIVA>) {
        const doc = this.ivaRepo.create(data);
        return await this.ivaRepo.save(doc);
    }

    async toggleIva(id: number) {
        const doc = await this.ivaRepo.findOne({ where: { id } });
        if (!doc) throw new NotFoundException('Impuesto no encontrado');
        doc.activo = !doc.activo;
        return await this.ivaRepo.save(doc);
    }

    // --- RETENCIONES ---
    async findAllRetenciones() {
        return await this.retencionRepo.find({ order: { codigo: 'ASC' } });
    }

    async createRetencion(data: Partial<RetencionSRI>) {
        const doc = this.retencionRepo.create(data);
        return await this.retencionRepo.save(doc);
    }

    async toggleRetencion(id: number) {
        const doc = await this.retencionRepo.findOne({ where: { id } });
        if (!doc) throw new NotFoundException('Retención no encontrada');
        doc.activo = !doc.activo;
        return await this.retencionRepo.save(doc);
    }

    // --- SUSTENTO TRIBUTARIO ---
    async findAllSustento() {
        return await this.sustentoRepo.find({ order: { codigo: 'ASC' } });
    }

    async createSustento(data: Partial<SustentoTributario>) {
        const doc = this.sustentoRepo.create(data);
        return await this.sustentoRepo.save(doc);
    }
}
