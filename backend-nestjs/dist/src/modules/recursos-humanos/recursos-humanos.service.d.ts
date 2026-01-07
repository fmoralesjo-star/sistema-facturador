import { Repository } from 'typeorm';
import { Empleado } from './entities/empleado.entity';
import { Asistencia } from './entities/asistencia.entity';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { ContabilidadService } from '../contabilidad/contabilidad.service';
export declare class RecursosHumanosService {
    private empleadoRepository;
    private asistenciaRepository;
    private contabilidadService;
    constructor(empleadoRepository: Repository<Empleado>, asistenciaRepository: Repository<Asistencia>, contabilidadService: ContabilidadService);
    generarRolPagos(periodo: string): Promise<{
        mensaje: string;
        detalles: {
            empleados: number;
            totalNomina: number;
            asientoContable: string;
        };
    }>;
    findAllEmpleados(): Promise<Empleado[]>;
    createEmpleado(createDto: CreateEmpleadoDto): Promise<Empleado>;
    updateEmpleado(id: number, updateDto: CreateEmpleadoDto): Promise<Empleado>;
    removeEmpleado(id: number): Promise<{
        message: string;
    }>;
    findAllAsistencias(): Promise<Asistencia[]>;
    createAsistencia(createDto: CreateAsistenciaDto): Promise<Asistencia>;
}
