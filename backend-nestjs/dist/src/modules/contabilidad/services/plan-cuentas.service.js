"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanCuentasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cuenta_contable_entity_1 = require("../entities/cuenta-contable.entity");
let PlanCuentasService = class PlanCuentasService {
    constructor(cuentaRepository) {
        this.cuentaRepository = cuentaRepository;
    }
    async create(createDto) {
        const existe = await this.cuentaRepository.findOne({
            where: { codigo: createDto.codigo },
        });
        if (existe) {
            throw new common_1.BadRequestException(`Ya existe una cuenta con el código ${createDto.codigo}`);
        }
        this.validarFormatoCodigo(createDto.codigo);
        let nivel = 1;
        let padre = null;
        if (createDto.padre_id) {
            padre = await this.cuentaRepository.findOne({
                where: { id: createDto.padre_id },
            });
            if (!padre) {
                throw new common_1.NotFoundException('Cuenta padre no encontrada');
            }
            nivel = padre.nivel + 1;
            if (!createDto.codigo.startsWith(padre.codigo)) {
                throw new common_1.BadRequestException(`El código de la cuenta hijo debe comenzar con el código del padre (${padre.codigo})`);
            }
            if (!padre.permite_movimiento && createDto.permite_movimiento !== false) {
                createDto.permite_movimiento = false;
            }
        }
        const tiposValidos = ['ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO', 'EGRESO', 'COSTO'];
        if (!tiposValidos.includes(createDto.tipo)) {
            throw new common_1.BadRequestException(`Tipo inválido. Debe ser uno de: ${tiposValidos.join(', ')}`);
        }
        let naturaleza = createDto.naturaleza;
        if (!naturaleza) {
            if (['ACTIVO', 'EGRESO', 'COSTO'].includes(createDto.tipo)) {
                naturaleza = 'DEUDORA';
            }
            else {
                naturaleza = 'ACREEDORA';
            }
        }
        const cuenta = this.cuentaRepository.create({
            ...createDto,
            nivel,
            padre_id: createDto.padre_id || null,
            activa: true,
            permite_movimiento: createDto.permite_movimiento ?? false,
            naturaleza,
            requiere_auxiliar: createDto.requiere_auxiliar ?? false,
            requiere_centro_costo: createDto.requiere_centro_costo ?? false,
        });
        return this.cuentaRepository.save(cuenta);
    }
    async findAll() {
        const todas = await this.cuentaRepository.find({
            relations: ['padre', 'hijos'],
            order: { codigo: 'ASC' },
        });
        return this.construirArbol(todas);
    }
    async findOne(id) {
        const cuenta = await this.cuentaRepository.findOne({
            where: { id },
            relations: ['padre', 'hijos'],
        });
        if (!cuenta) {
            throw new common_1.NotFoundException(`Cuenta con ID ${id} no encontrada`);
        }
        return cuenta;
    }
    async findByCodigo(codigo) {
        const cuenta = await this.cuentaRepository.findOne({
            where: { codigo },
            relations: ['padre', 'hijos'],
        });
        if (!cuenta) {
            throw new common_1.NotFoundException(`Cuenta con código ${codigo} no encontrada`);
        }
        return cuenta;
    }
    async findCuentasMovimiento() {
        return this.cuentaRepository.find({
            where: { permite_movimiento: true, activa: true },
            order: { codigo: 'ASC' },
        });
    }
    async update(id, updateDto) {
        const cuenta = await this.findOne(id);
        if (updateDto.permite_movimiento === false && cuenta.hijos?.length > 0) {
            throw new common_1.BadRequestException('No se puede desactivar movimientos en una cuenta que tiene hijos');
        }
        Object.assign(cuenta, updateDto);
        return this.cuentaRepository.save(cuenta);
    }
    async remove(id) {
        const cuenta = await this.findOne(id);
        const hijos = await this.cuentaRepository.find({
            where: { padre_id: id },
        });
        if (hijos.length > 0) {
            throw new common_1.BadRequestException('No se puede eliminar una cuenta que tiene cuentas hijas');
        }
        await this.cuentaRepository.remove(cuenta);
    }
    async removeAll() {
        try {
            await this.cuentaRepository.clear();
        }
        catch (error) {
            const tableName = this.cuentaRepository.metadata.tableName;
            await this.cuentaRepository.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`);
        }
    }
    async inicializarPlanBasico() {
        try {
            const existe = await this.cuentaRepository.count();
            if (existe > 0) {
                throw new common_1.BadRequestException('El plan de cuentas ya está inicializado');
            }
            const activos = await this.create({
                codigo: '1',
                nombre: 'ACTIVOS',
                tipo: 'ACTIVO',
                permite_movimiento: false,
                naturaleza: 'DEUDORA',
            });
            const activoCorriente = await this.create({
                codigo: '1.1',
                nombre: 'Activo Corriente',
                tipo: 'ACTIVO',
                padre_id: activos.id,
                permite_movimiento: false,
                naturaleza: 'DEUDORA',
            });
            const efectivo = await this.create({ codigo: '1.1.01', nombre: 'Efectivo y Equivalentes al Efectivo', tipo: 'ACTIVO', padre_id: activoCorriente.id, permite_movimiento: false, naturaleza: 'DEUDORA' });
            await this.create({ codigo: '1.1.01.01', nombre: 'Caja General', tipo: 'ACTIVO', padre_id: efectivo.id, permite_movimiento: true, naturaleza: 'DEUDORA' });
            await this.create({ codigo: '1.1.01.02', nombre: 'Bancos', tipo: 'ACTIVO', padre_id: efectivo.id, permite_movimiento: true, naturaleza: 'DEUDORA', requiere_auxiliar: true });
            const cxc = await this.create({ codigo: '1.1.02', nombre: 'Cuentas y Documentos por Cobrar Comerciales Corrientes', tipo: 'ACTIVO', padre_id: activoCorriente.id, permite_movimiento: true, naturaleza: 'DEUDORA', requiere_auxiliar: true });
            await this.create({ codigo: '1.1.03', nombre: 'Inventarios', tipo: 'ACTIVO', padre_id: activoCorriente.id, permite_movimiento: true, naturaleza: 'DEUDORA' });
            const impuestosActivo = await this.create({ codigo: '1.1.04', nombre: 'Activos por Impuestos Corrientes', tipo: 'ACTIVO', padre_id: activoCorriente.id, permite_movimiento: false, naturaleza: 'DEUDORA' });
            await this.create({ codigo: '1.1.04.01', nombre: 'Crédito Tributario IVA', tipo: 'ACTIVO', padre_id: impuestosActivo.id, permite_movimiento: true, naturaleza: 'DEUDORA', sri_codigo: '101' });
            const activoNoCorriente = await this.create({
                codigo: '1.2',
                nombre: 'Activo No Corriente',
                tipo: 'ACTIVO',
                padre_id: activos.id,
                permite_movimiento: false,
                naturaleza: 'DEUDORA',
            });
            await this.create({ codigo: '1.2.01', nombre: 'Propiedades, Planta y Equipo', tipo: 'ACTIVO', padre_id: activoNoCorriente.id, permite_movimiento: true, naturaleza: 'DEUDORA' });
            const pasivos = await this.create({
                codigo: '2',
                nombre: 'PASIVOS',
                tipo: 'PASIVO',
                permite_movimiento: false,
                naturaleza: 'ACREEDORA',
            });
            const pasivoCorriente = await this.create({
                codigo: '2.1',
                nombre: 'Pasivo Corriente',
                tipo: 'PASIVO',
                padre_id: pasivos.id,
                permite_movimiento: false,
                naturaleza: 'ACREEDORA',
            });
            await this.create({ codigo: '2.1.01', nombre: 'Cuentas y Documentos por Pagar Comerciales Corrientes', tipo: 'PASIVO', padre_id: pasivoCorriente.id, permite_movimiento: true, naturaleza: 'ACREEDORA', requiere_auxiliar: true });
            const obligacionesTrib = await this.create({ codigo: '2.1.02', nombre: 'Obligaciones con la Administración Tributaria', tipo: 'PASIVO', padre_id: pasivoCorriente.id, permite_movimiento: false, naturaleza: 'ACREEDORA' });
            await this.create({ codigo: '2.1.02.01', nombre: 'IVA por Pagar', tipo: 'PASIVO', padre_id: obligacionesTrib.id, permite_movimiento: true, naturaleza: 'ACREEDORA' });
            await this.create({ codigo: '2.1.02.02', nombre: 'Retenciones en la Fuente por Pagar', tipo: 'PASIVO', padre_id: obligacionesTrib.id, permite_movimiento: true, naturaleza: 'ACREEDORA' });
            await this.create({ codigo: '2.1.03', nombre: 'Obligaciones con el IESS', tipo: 'PASIVO', padre_id: pasivoCorriente.id, permite_movimiento: true, naturaleza: 'ACREEDORA' });
            await this.create({ codigo: '2.1.04', nombre: 'Beneficios a Empleados por Pagar', tipo: 'PASIVO', padre_id: pasivoCorriente.id, permite_movimiento: true, naturaleza: 'ACREEDORA', requiere_auxiliar: true });
            const patrimonio = await this.create({
                codigo: '3',
                nombre: 'PATRIMONIO',
                tipo: 'PATRIMONIO',
                permite_movimiento: false,
                naturaleza: 'ACREEDORA',
            });
            await this.create({ codigo: '3.1', nombre: 'Capital Social', tipo: 'PATRIMONIO', padre_id: patrimonio.id, permite_movimiento: true, naturaleza: 'ACREEDORA' });
            await this.create({ codigo: '3.2', nombre: 'Reservas', tipo: 'PATRIMONIO', padre_id: patrimonio.id, permite_movimiento: true, naturaleza: 'ACREEDORA' });
            await this.create({ codigo: '3.3', nombre: 'Resultados Acumulados', tipo: 'PATRIMONIO', padre_id: patrimonio.id, permite_movimiento: true, naturaleza: 'ACREEDORA' });
            const ingresos = await this.create({
                codigo: '4',
                nombre: 'INGRESOS',
                tipo: 'INGRESO',
                permite_movimiento: false,
                naturaleza: 'ACREEDORA',
            });
            const ingresosOrd = await this.create({ codigo: '4.1', nombre: 'Ingresos de Actividades Ordinarias', tipo: 'INGRESO', padre_id: ingresos.id, permite_movimiento: false, naturaleza: 'ACREEDORA' });
            await this.create({ codigo: '4.1.01', nombre: 'Ventas de Bienes y Servicios', tipo: 'INGRESO', padre_id: ingresosOrd.id, permite_movimiento: true, naturaleza: 'ACREEDORA', sri_codigo: '601' });
            await this.create({ codigo: '4.1.03', nombre: 'Ingresos por Ajuste de Inventario', tipo: 'INGRESO', padre_id: ingresosOrd.id, permite_movimiento: true, naturaleza: 'ACREEDORA' });
            await this.create({ codigo: '4.2', nombre: 'Otros Ingresos', tipo: 'INGRESO', padre_id: ingresos.id, permite_movimiento: true, naturaleza: 'ACREEDORA' });
            const gastos = await this.create({
                codigo: '5',
                nombre: 'GASTOS',
                tipo: 'EGRESO',
                permite_movimiento: false,
                naturaleza: 'DEUDORA',
            });
            const gastosVentas = await this.create({ codigo: '5.1', nombre: 'Gastos de Ventas', tipo: 'EGRESO', padre_id: gastos.id, permite_movimiento: false, naturaleza: 'DEUDORA' });
            await this.create({ codigo: '5.1.03', nombre: 'Gastos por Ajuste de Inventario', tipo: 'EGRESO', padre_id: gastosVentas.id, permite_movimiento: true, naturaleza: 'DEUDORA', requiere_centro_costo: true });
            await this.create({ codigo: '5.2', nombre: 'Gastos Administrativos', tipo: 'EGRESO', padre_id: gastos.id, permite_movimiento: true, naturaleza: 'DEUDORA', requiere_centro_costo: true });
            await this.create({ codigo: '5.3', nombre: 'Gastos Financieros', tipo: 'EGRESO', padre_id: gastos.id, permite_movimiento: true, naturaleza: 'DEUDORA', requiere_centro_costo: true });
            const costos = await this.create({
                codigo: '6',
                nombre: 'COSTOS DE PRODUCCIÓN',
                tipo: 'COSTO',
                permite_movimiento: false,
                naturaleza: 'DEUDORA',
            });
            await this.create({ codigo: '6.1', nombre: 'Costo de Ventas y Producción', tipo: 'COSTO', padre_id: costos.id, permite_movimiento: true, naturaleza: 'DEUDORA', requiere_centro_costo: true });
        }
        catch (error) {
            console.error('CRITICAL ERROR inicializarPlanBasico:', error);
            throw new common_1.BadRequestException('Error inicializando: ' + error.message);
        }
    }
    validarFormatoCodigo(codigo) {
        const patron = /^\d+(\.\d+)*$/;
        if (!patron.test(codigo)) {
            throw new common_1.BadRequestException('El código debe tener formato numérico jerárquico (ejemplo: 1.0.0, 1.1.01)');
        }
    }
    construirArbol(cuentas) {
        const mapa = new Map();
        const raices = [];
        cuentas.forEach((cuenta) => {
            cuenta.hijos = [];
            mapa.set(cuenta.id, cuenta);
        });
        cuentas.forEach((cuenta) => {
            if (cuenta.padre_id && mapa.has(cuenta.padre_id)) {
                const padre = mapa.get(cuenta.padre_id);
                if (padre) {
                    padre.hijos.push(cuenta);
                }
            }
            else {
                raices.push(cuenta);
            }
        });
        return raices;
    }
};
exports.PlanCuentasService = PlanCuentasService;
exports.PlanCuentasService = PlanCuentasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cuenta_contable_entity_1.CuentaContable)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PlanCuentasService);
//# sourceMappingURL=plan-cuentas.service.js.map