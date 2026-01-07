import { RecursosHumanosService } from './recursos-humanos.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
export declare class RecursosHumanosController {
    private readonly rhService;
    constructor(rhService: RecursosHumanosService);
    findAllEmpleados(): Promise<import("./entities/empleado.entity").Empleado[]>;
    createEmpleado(createDto: CreateEmpleadoDto): Promise<import("./entities/empleado.entity").Empleado>;
    updateEmpleado(id: number, updateDto: CreateEmpleadoDto): Promise<import("./entities/empleado.entity").Empleado>;
    removeEmpleado(id: number): Promise<{
        message: string;
    }>;
    findAllAsistencias(): Promise<import("./entities/asistencia.entity").Asistencia[]>;
    createAsistencia(createDto: CreateAsistenciaDto): Promise<import("./entities/asistencia.entity").Asistencia>;
    generarRol(periodo: string): Promise<{
        mensaje: string;
        detalles: {
            empleados: number;
            totalNomina: number;
            asientoContable: string;
        };
    }>;
}
