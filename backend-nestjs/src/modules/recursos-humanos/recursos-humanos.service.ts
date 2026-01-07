import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado } from './entities/empleado.entity';
import { Asistencia } from './entities/asistencia.entity';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { ContabilidadService } from '../contabilidad/contabilidad.service';

@Injectable()
export class RecursosHumanosService {
  constructor(
    @InjectRepository(Empleado)
    private empleadoRepository: Repository<Empleado>,
    @InjectRepository(Asistencia)
    private asistenciaRepository: Repository<Asistencia>,
    private contabilidadService: ContabilidadService,
  ) { }

  async generarRolPagos(periodo: string) {
    const empleados = await this.empleadoRepository.find({ where: { activo: true } });

    // Cálculo de nómina real usando sueldos individuales
    let totalIngresos = 0;

    for (const emp of empleados) {
      // Usar sueldo del empleado o básico por defecto
      const sueldo = Number(emp.sueldo) || 460;
      totalIngresos += sueldo;
    }

    const totalAportePatronal = totalIngresos * 0.1215; // 12.15%
    const totalIessPersonal = totalIngresos * 0.0945; // 9.45%
    const totalPagar = totalIngresos - totalIessPersonal;

    // Generar Asiento Contable
    const asiento = await this.contabilidadService.crearAsientoNomina({
      periodo,
      totalIngresos,
      totalAportePatronal,
      totalIessPersonal,
      totalPagar
    });

    return {
      mensaje: 'Rol de pagos generado y contabilizado exitosamente',
      detalles: {
        empleados: empleados.length,
        totalNomina: totalIngresos,
        asientoContable: asiento.numero_asiento
      }
    };
  }

  async findAllEmpleados() {
    return this.empleadoRepository.find({
      order: { nombre: 'ASC', apellido: 'ASC' },
    });
  }

  async createEmpleado(createDto: CreateEmpleadoDto) {
    const empleado = this.empleadoRepository.create({
      ...createDto,
      fecha_ingreso: createDto.fecha_ingreso ? new Date(createDto.fecha_ingreso) : new Date(),
      fecha_nacimiento: createDto.fecha_nacimiento ? new Date(createDto.fecha_nacimiento) : null,
    });
    return this.empleadoRepository.save(empleado);
  }

  async updateEmpleado(id: number, updateDto: CreateEmpleadoDto) {
    const empleado = await this.empleadoRepository.findOne({ where: { id } });
    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    Object.assign(empleado, {
      ...updateDto,
      fecha_ingreso: updateDto.fecha_ingreso ? new Date(updateDto.fecha_ingreso) : empleado.fecha_ingreso,
      fecha_nacimiento: updateDto.fecha_nacimiento ? new Date(updateDto.fecha_nacimiento) : empleado.fecha_nacimiento,
    });

    return this.empleadoRepository.save(empleado);
  }

  async removeEmpleado(id: number) {
    const empleado = await this.empleadoRepository.findOne({ where: { id } });
    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }
    await this.empleadoRepository.remove(empleado);
    return { message: 'Empleado eliminado exitosamente' };
  }

  async findAllAsistencias() {
    return this.asistenciaRepository.find({
      relations: ['empleado'],
      order: { fecha: 'DESC', id: 'DESC' },
    });
  }

  async createAsistencia(createDto: CreateAsistenciaDto) {
    const asistencia = this.asistenciaRepository.create({
      ...createDto,
      fecha: createDto.fecha ? new Date(createDto.fecha) : new Date(),
    });
    return this.asistenciaRepository.save(asistencia);
  }
}












