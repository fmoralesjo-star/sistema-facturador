import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promocion } from './entities/promocion.entity';
import { CreatePromocionDto } from './dto/create-promocion.dto';

@Injectable()
export class PromocionesService {
  constructor(
    @InjectRepository(Promocion)
    private promocionRepository: Repository<Promocion>,
  ) {}

  async findAll() {
    return this.promocionRepository.find({
      relations: ['producto'],
      order: { fecha_inicio: 'DESC', id: 'DESC' },
    });
  }

  async create(createDto: CreatePromocionDto) {
    const promocion = this.promocionRepository.create({
      ...createDto,
      fecha_inicio: createDto.fecha_inicio ? new Date(createDto.fecha_inicio) : new Date(),
      fecha_fin: createDto.fecha_fin ? new Date(createDto.fecha_fin) : null,
      dias_semana: createDto.dias_semana ? JSON.stringify(createDto.dias_semana) : null,
      usos_actuales: 0,
    });
    return this.promocionRepository.save(promocion);
  }

  async findOne(id: number) {
    const promocion = await this.promocionRepository.findOne({
      where: { id },
      relations: ['producto'],
    });
    if (!promocion) {
      throw new NotFoundException(`Promoción con ID ${id} no encontrada`);
    }
    return promocion;
  }

  async update(id: number, updateDto: Partial<CreatePromocionDto>) {
    const promocion = await this.promocionRepository.findOne({ where: { id } });
    if (!promocion) {
      throw new NotFoundException(`Promoción con ID ${id} no encontrada`);
    }

    Object.assign(promocion, {
      ...updateDto,
      fecha_inicio: updateDto.fecha_inicio ? new Date(updateDto.fecha_inicio) : promocion.fecha_inicio,
      fecha_fin: updateDto.fecha_fin ? new Date(updateDto.fecha_fin) : promocion.fecha_fin,
      dias_semana: updateDto.dias_semana ? JSON.stringify(updateDto.dias_semana) : promocion.dias_semana,
    });

    return this.promocionRepository.save(promocion);
  }

  async remove(id: number) {
    const promocion = await this.promocionRepository.findOne({ where: { id } });
    if (!promocion) {
      throw new NotFoundException(`Promoción con ID ${id} no encontrada`);
    }
    await this.promocionRepository.remove(promocion);
    return { message: 'Promoción eliminada exitosamente' };
  }

  async findActivasPorProducto(productoId: number) {
    const ahora = new Date();
    return this.promocionRepository.find({
      where: [
        { producto_id: productoId, estado: 'activa' },
        { producto_id: null, estado: 'activa' },
      ],
      relations: ['producto'],
    }).then(promociones => {
      return promociones.filter(p => {
        const fechaInicio = new Date(p.fecha_inicio);
        const fechaFin = p.fecha_fin ? new Date(p.fecha_fin) : null;
        
        if (ahora < fechaInicio) return false;
        if (fechaFin && ahora > fechaFin) return false;
        
        // Verificar días de la semana
        if (p.dias_semana) {
          try {
            const dias = JSON.parse(p.dias_semana);
            const diaActual = ahora.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
            if (dias.length > 0 && !dias.includes(diaActual)) return false;
          } catch (e) {
            // Si hay error parseando, ignorar validación de días
          }
        }
        
        // Verificar máximo de usos
        if (p.maximo_usos && p.usos_actuales >= p.maximo_usos) return false;
        
        return true;
      });
    });
  }
}

