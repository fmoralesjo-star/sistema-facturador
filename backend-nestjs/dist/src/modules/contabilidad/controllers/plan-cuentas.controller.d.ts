import { PlanCuentasService, CreateCuentaDto, UpdateCuentaDto } from '../services/plan-cuentas.service';
export declare class PlanCuentasController {
    private readonly planCuentasService;
    constructor(planCuentasService: PlanCuentasService);
    create(createDto: CreateCuentaDto): Promise<import("../entities/cuenta-contable.entity").CuentaContable>;
    findAll(): Promise<import("../entities/cuenta-contable.entity").CuentaContable[]>;
    findCuentasMovimiento(): Promise<import("../entities/cuenta-contable.entity").CuentaContable[]>;
    inicializar(): Promise<{
        message: string;
    }>;
    findOne(id: string): Promise<import("../entities/cuenta-contable.entity").CuentaContable>;
    findByCodigo(codigo: string): Promise<import("../entities/cuenta-contable.entity").CuentaContable>;
    update(id: string, updateDto: UpdateCuentaDto): Promise<import("../entities/cuenta-contable.entity").CuentaContable>;
    remove(id: string): Promise<void>;
}
