import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from '../compras/entities/proveedor.entity';

@Injectable()
export class ProveedoresService {
    constructor(
        @InjectRepository(Proveedor)
        private readonly proveedorRepository: Repository<Proveedor>,
    ) { }

    async create(data: any): Promise<Proveedor> {
        // Basic validation check if code already exists
        const existing = await this.proveedorRepository.findOne({ where: { codigo: data.codigo } });
        if (existing) {
            throw new Error('El código de proveedor ya existe');
        }
        const proveedor = this.proveedorRepository.create(data) as unknown as Proveedor;
        return this.proveedorRepository.save(proveedor);
    }

    async findAll(): Promise<Proveedor[]> {
        return this.proveedorRepository.find({
            order: { nombre: 'ASC' }
        });
    }

    async findOne(id: number): Promise<Proveedor> {
        const proveedor = await this.proveedorRepository.findOne({ where: { id } });
        if (!proveedor) {
            throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
        }
        return proveedor;
    }

    async update(id: number, data: any): Promise<Proveedor> {
        const proveedor = await this.findOne(id);
        this.proveedorRepository.merge(proveedor, data);
        return this.proveedorRepository.save(proveedor);
    }

    async remove(id: number): Promise<void> {
        const proveedor = await this.findOne(id);
        await this.proveedorRepository.remove(proveedor);
    }
}
