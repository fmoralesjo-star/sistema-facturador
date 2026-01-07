import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from './entities/empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Injectable()
export class EmpresaService {
  constructor(
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
  ) { }

  async create(createEmpresaDto: CreateEmpresaDto): Promise<Empresa> {
    // Verificar si ya existe una empresa con el mismo RUC
    const empresaExistente = await this.empresaRepository.findOne({
      where: { ruc: createEmpresaDto.ruc },
    });

    if (empresaExistente) {
      throw new BadRequestException(
        `Ya existe una empresa con el RUC ${createEmpresaDto.ruc}`,
      );
    }

    const empresa = this.empresaRepository.create(createEmpresaDto);
    return this.empresaRepository.save(empresa);
  }

  async findAll(): Promise<Empresa[]> {
    return this.empresaRepository.find({
      order: { razon_social: 'ASC' },
    });
  }

  async findActive(): Promise<Empresa | null> {
    return this.empresaRepository.findOne({
      where: { activa: true },
    });
  }

  async findOne(id: number): Promise<Empresa> {
    const empresa = await this.empresaRepository.findOne({ where: { id } });
    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }
    return empresa;
  }

  async findByRuc(ruc: string): Promise<Empresa | null> {
    return this.empresaRepository.findOne({ where: { ruc } });
  }

  async update(id: number, updateEmpresaDto: UpdateEmpresaDto): Promise<Empresa> {
    const empresa = await this.findOne(id);

    // Si se está actualizando el RUC, verificar que no exista otra empresa con ese RUC
    if (updateEmpresaDto.ruc && updateEmpresaDto.ruc !== empresa.ruc) {
      const empresaExistente = await this.findByRuc(updateEmpresaDto.ruc);
      if (empresaExistente && empresaExistente.id !== id) {
        throw new BadRequestException(
          `Ya existe otra empresa con el RUC ${updateEmpresaDto.ruc}`,
        );
      }
    }

    // Mapear 'direccion' a 'direccion_matriz' para compatibilidad con frontend
    const dtoToUpdate: any = { ...updateEmpresaDto };
    if (dtoToUpdate.direccion && !dtoToUpdate.direccion_matriz) {
      dtoToUpdate.direccion_matriz = dtoToUpdate.direccion;
    }
    delete dtoToUpdate.direccion; // Eliminar campo que no existe en la entidad

    this.empresaRepository.merge(empresa, dtoToUpdate);
    return this.empresaRepository.save(empresa);
  }

  async remove(id: number): Promise<void> {
    const empresa = await this.findOne(id);
    await this.empresaRepository.remove(empresa);
  }

  async activate(id: number): Promise<Empresa> {
    const empresa = await this.findOne(id);
    empresa.activa = true;
    return this.empresaRepository.save(empresa);
  }

  async deactivate(id: number): Promise<Empresa> {
    const empresa = await this.findOne(id);
    empresa.activa = false;
    return this.empresaRepository.save(empresa);
  }
}


















