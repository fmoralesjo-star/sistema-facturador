import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { CuentaContable } from '../entities/cuenta-contable.entity';

export interface CreateCuentaDto {
  codigo: string;
  nombre: string;
  tipo: string;
  padre_id?: number;
  descripcion?: string;
  permite_movimiento?: boolean;
  naturaleza?: 'DEUDORA' | 'ACREEDORA';
  sri_codigo?: string;
  requiere_auxiliar?: boolean;
  requiere_centro_costo?: boolean;
}

export interface UpdateCuentaDto {
  nombre?: string;
  descripcion?: string;
  activa?: boolean;
  permite_movimiento?: boolean;
  naturaleza?: 'DEUDORA' | 'ACREEDORA';
  sri_codigo?: string;
  requiere_auxiliar?: boolean;
  requiere_centro_costo?: boolean;
}

@Injectable()
export class PlanCuentasService {
  constructor(
    @InjectRepository(CuentaContable)
    private cuentaRepository: Repository<CuentaContable>,
  ) { }

  /**
   * Crea una nueva cuenta contable
   */
  async create(createDto: CreateCuentaDto): Promise<CuentaContable> {
    // Validar código único
    const existe = await this.cuentaRepository.findOne({
      where: { codigo: createDto.codigo },
    });
    if (existe) {
      throw new BadRequestException(
        `Ya existe una cuenta con el código ${createDto.codigo}`,
      );
    }

    // Validar código según formato jerárquico
    this.validarFormatoCodigo(createDto.codigo);

    // Si tiene padre, validarlo
    let nivel = 1;
    let padre: CuentaContable | null = null;

    if (createDto.padre_id) {
      padre = await this.cuentaRepository.findOne({
        where: { id: createDto.padre_id },
      });
      if (!padre) {
        throw new NotFoundException('Cuenta padre no encontrada');
      }
      nivel = padre.nivel + 1;

      // Validar que el código del padre sea prefijo del código hijo
      if (!createDto.codigo.startsWith(padre.codigo)) {
        throw new BadRequestException(
          `El código de la cuenta hijo debe comenzar con el código del padre (${padre.codigo})`,
        );
      }

      // Si el padre no permite movimientos, esta cuenta tampoco debería
      if (!padre.permite_movimiento && createDto.permite_movimiento !== false) {
        createDto.permite_movimiento = false;
      }
    }

    // Validar tipo
    const tiposValidos = ['ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO', 'EGRESO', 'COSTO'];
    if (!tiposValidos.includes(createDto.tipo)) {
      throw new BadRequestException(
        `Tipo inválido. Debe ser uno de: ${tiposValidos.join(', ')}`,
      );
    }

    // Determinar naturaleza por defecto si no se especifica
    let naturaleza = createDto.naturaleza;
    if (!naturaleza) {
      if (['ACTIVO', 'EGRESO', 'COSTO'].includes(createDto.tipo)) {
        naturaleza = 'DEUDORA';
      } else {
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

  /**
   * Obtiene todas las cuentas en formato jerárquico
   */
  async findAll(): Promise<CuentaContable[]> {
    const todas = await this.cuentaRepository.find({
      relations: ['padre', 'hijos'],
      order: { codigo: 'ASC' },
    });

    // Construir árbol jerárquico
    return this.construirArbol(todas);
  }

  /**
   * Obtiene una cuenta por ID
   */
  async findOne(id: number): Promise<CuentaContable> {
    const cuenta = await this.cuentaRepository.findOne({
      where: { id },
      relations: ['padre', 'hijos'],
    });

    if (!cuenta) {
      throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
    }

    return cuenta;
  }

  /**
   * Obtiene una cuenta por código
   */
  async findByCodigo(codigo: string): Promise<CuentaContable> {
    const cuenta = await this.cuentaRepository.findOne({
      where: { codigo },
      relations: ['padre', 'hijos'],
    });

    if (!cuenta) {
      throw new NotFoundException(`Cuenta con código ${codigo} no encontrada`);
    }

    return cuenta;
  }

  /**
   * Obtiene todas las cuentas que permiten movimientos (último nivel)
   */
  async findCuentasMovimiento(): Promise<CuentaContable[]> {
    return this.cuentaRepository.find({
      where: { permite_movimiento: true, activa: true },
      order: { codigo: 'ASC' },
    });
  }

  /**
   * Actualiza una cuenta
   */
  async update(id: number, updateDto: UpdateCuentaDto): Promise<CuentaContable> {
    const cuenta = await this.findOne(id);

    // Validaciones
    if (updateDto.permite_movimiento === false && cuenta.hijos?.length > 0) {
      throw new BadRequestException(
        'No se puede desactivar movimientos en una cuenta que tiene hijos',
      );
    }

    Object.assign(cuenta, updateDto);
    return this.cuentaRepository.save(cuenta);
  }

  /**
   * Elimina una cuenta (solo si no tiene movimientos ni hijos)
   */
  async remove(id: number): Promise<void> {
    const cuenta = await this.findOne(id);

    // Verificar si tiene hijos
    const hijos = await this.cuentaRepository.find({
      where: { padre_id: id },
    });
    if (hijos.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar una cuenta que tiene cuentas hijas',
      );
    }

    // TODO: Verificar si tiene movimientos en partidas contables
    // Por ahora solo validamos hijos

    await this.cuentaRepository.remove(cuenta);
  }

  /**
   * Inicializa el plan de cuentas básico
   */
  async removeAll(): Promise<void> {
    try {
      await this.cuentaRepository.clear();
    } catch (error) {
      // Fallback for FK constraint: Cascade truncating via raw query using the metadata tableName
      const tableName = this.cuentaRepository.metadata.tableName;
      await this.cuentaRepository.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`);
    }
  }

  /**
   * Inicializa el plan de cuentas básico según norma SRI Ecuador
   */
  async inicializarPlanBasico(): Promise<void> {
    try {
      const existe = await this.cuentaRepository.count();
      if (existe > 0) {
        throw new BadRequestException('El plan de cuentas ya está inicializado');
      }

      // 1. ACTIVOS
      const activos = await this.create({
        codigo: '1',
        nombre: 'ACTIVOS',
        tipo: 'ACTIVO',
        permite_movimiento: false,
        naturaleza: 'DEUDORA',
      });

      // 1.1 Activo Corriente
      const activoCorriente = await this.create({
        codigo: '1.1',
        nombre: 'Activo Corriente',
        tipo: 'ACTIVO',
        padre_id: activos.id,
        permite_movimiento: false,
        naturaleza: 'DEUDORA',
      });

      // 1.1.01 Efectivo y Equivalentes (Padre de Caja y Bancos)
      const efectivo = await this.create({ codigo: '1.1.01', nombre: 'Efectivo y Equivalentes al Efectivo', tipo: 'ACTIVO', padre_id: activoCorriente.id, permite_movimiento: false, naturaleza: 'DEUDORA' });

      await this.create({ codigo: '1.1.01.01', nombre: 'Caja General', tipo: 'ACTIVO', padre_id: efectivo.id, permite_movimiento: true, naturaleza: 'DEUDORA' });
      await this.create({ codigo: '1.1.01.02', nombre: 'Bancos', tipo: 'ACTIVO', padre_id: efectivo.id, permite_movimiento: true, naturaleza: 'DEUDORA', requiere_auxiliar: true });

      // 1.1.02 Cuentas por Cobrar
      const cxc = await this.create({ codigo: '1.1.02', nombre: 'Cuentas y Documentos por Cobrar Comerciales Corrientes', tipo: 'ACTIVO', padre_id: activoCorriente.id, permite_movimiento: true, naturaleza: 'DEUDORA', requiere_auxiliar: true });

      // 1.1.03 Inventarios
      await this.create({ codigo: '1.1.03', nombre: 'Inventarios', tipo: 'ACTIVO', padre_id: activoCorriente.id, permite_movimiento: true, naturaleza: 'DEUDORA' });

      // 1.1.04 Impuestos (Nuevo para Crédito Tributario)
      const impuestosActivo = await this.create({ codigo: '1.1.04', nombre: 'Activos por Impuestos Corrientes', tipo: 'ACTIVO', padre_id: activoCorriente.id, permite_movimiento: false, naturaleza: 'DEUDORA' });
      await this.create({ codigo: '1.1.04.01', nombre: 'Crédito Tributario IVA', tipo: 'ACTIVO', padre_id: impuestosActivo.id, permite_movimiento: true, naturaleza: 'DEUDORA', sri_codigo: '101' });

      // 1.2 Activo No Corriente
      const activoNoCorriente = await this.create({
        codigo: '1.2',
        nombre: 'Activo No Corriente',
        tipo: 'ACTIVO',
        padre_id: activos.id,
        permite_movimiento: false,
        naturaleza: 'DEUDORA',
      });

      await this.create({ codigo: '1.2.01', nombre: 'Propiedades, Planta y Equipo', tipo: 'ACTIVO', padre_id: activoNoCorriente.id, permite_movimiento: true, naturaleza: 'DEUDORA' });

      // 2. PASIVOS
      const pasivos = await this.create({
        codigo: '2',
        nombre: 'PASIVOS',
        tipo: 'PASIVO',
        permite_movimiento: false,
        naturaleza: 'ACREEDORA',
      });

      // 2.1 Pasivo Corriente
      const pasivoCorriente = await this.create({
        codigo: '2.1',
        nombre: 'Pasivo Corriente',
        tipo: 'PASIVO',
        padre_id: pasivos.id,
        permite_movimiento: false,
        naturaleza: 'ACREEDORA',
      });

      await this.create({ codigo: '2.1.01', nombre: 'Cuentas y Documentos por Pagar Comerciales Corrientes', tipo: 'PASIVO', padre_id: pasivoCorriente.id, permite_movimiento: true, naturaleza: 'ACREEDORA', requiere_auxiliar: true });

      // 2.1.02 Obligaciones Tributarias (Padre)
      const obligacionesTrib = await this.create({ codigo: '2.1.02', nombre: 'Obligaciones con la Administración Tributaria', tipo: 'PASIVO', padre_id: pasivoCorriente.id, permite_movimiento: false, naturaleza: 'ACREEDORA' });
      await this.create({ codigo: '2.1.02.01', nombre: 'IVA por Pagar', tipo: 'PASIVO', padre_id: obligacionesTrib.id, permite_movimiento: true, naturaleza: 'ACREEDORA' });
      await this.create({ codigo: '2.1.02.02', nombre: 'Retenciones en la Fuente por Pagar', tipo: 'PASIVO', padre_id: obligacionesTrib.id, permite_movimiento: true, naturaleza: 'ACREEDORA' });

      await this.create({ codigo: '2.1.03', nombre: 'Obligaciones con el IESS', tipo: 'PASIVO', padre_id: pasivoCorriente.id, permite_movimiento: true, naturaleza: 'ACREEDORA' });
      await this.create({ codigo: '2.1.04', nombre: 'Beneficios a Empleados por Pagar', tipo: 'PASIVO', padre_id: pasivoCorriente.id, permite_movimiento: true, naturaleza: 'ACREEDORA', requiere_auxiliar: true });

      // 3. PATRIMONIO
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

      // 4. INGRESOS
      const ingresos = await this.create({
        codigo: '4',
        nombre: 'INGRESOS',
        tipo: 'INGRESO',
        permite_movimiento: false,
        naturaleza: 'ACREEDORA',
      });

      // 4.1 Ingresos Ordinarios
      const ingresosOrd = await this.create({ codigo: '4.1', nombre: 'Ingresos de Actividades Ordinarias', tipo: 'INGRESO', padre_id: ingresos.id, permite_movimiento: false, naturaleza: 'ACREEDORA' });
      await this.create({ codigo: '4.1.01', nombre: 'Ventas de Bienes y Servicios', tipo: 'INGRESO', padre_id: ingresosOrd.id, permite_movimiento: true, naturaleza: 'ACREEDORA', sri_codigo: '601' });
      await this.create({ codigo: '4.1.03', nombre: 'Ingresos por Ajuste de Inventario', tipo: 'INGRESO', padre_id: ingresosOrd.id, permite_movimiento: true, naturaleza: 'ACREEDORA' });

      await this.create({ codigo: '4.2', nombre: 'Otros Ingresos', tipo: 'INGRESO', padre_id: ingresos.id, permite_movimiento: true, naturaleza: 'ACREEDORA' });

      // 5. GASTOS
      const gastos = await this.create({
        codigo: '5',
        nombre: 'GASTOS',
        tipo: 'EGRESO',
        permite_movimiento: false,
        naturaleza: 'DEUDORA',
      });

      // 5.1 Gastos de Ventas (Padre)
      const gastosVentas = await this.create({ codigo: '5.1', nombre: 'Gastos de Ventas', tipo: 'EGRESO', padre_id: gastos.id, permite_movimiento: false, naturaleza: 'DEUDORA' });
      await this.create({ codigo: '5.1.03', nombre: 'Gastos por Ajuste de Inventario', tipo: 'EGRESO', padre_id: gastosVentas.id, permite_movimiento: true, naturaleza: 'DEUDORA', requiere_centro_costo: true });

      await this.create({ codigo: '5.2', nombre: 'Gastos Administrativos', tipo: 'EGRESO', padre_id: gastos.id, permite_movimiento: true, naturaleza: 'DEUDORA', requiere_centro_costo: true });
      await this.create({ codigo: '5.3', nombre: 'Gastos Financieros', tipo: 'EGRESO', padre_id: gastos.id, permite_movimiento: true, naturaleza: 'DEUDORA', requiere_centro_costo: true });

      // 6. COSTOS
      const costos = await this.create({
        codigo: '6',
        nombre: 'COSTOS DE PRODUCCIÓN',
        tipo: 'COSTO',
        permite_movimiento: false,
        naturaleza: 'DEUDORA',
      });

      await this.create({ codigo: '6.1', nombre: 'Costo de Ventas y Producción', tipo: 'COSTO', padre_id: costos.id, permite_movimiento: true, naturaleza: 'DEUDORA', requiere_centro_costo: true });
    } catch (error) {
      console.error('CRITICAL ERROR inicializarPlanBasico:', error);
      throw new BadRequestException('Error inicializando: ' + error.message);
    }
  }

  /**
   * Valida el formato del código (ejemplo: "1.0.0", "1.1.01")
   */
  private validarFormatoCodigo(codigo: string): void {
    const patron = /^\d+(\.\d+)*$/;
    if (!patron.test(codigo)) {
      throw new BadRequestException(
        'El código debe tener formato numérico jerárquico (ejemplo: 1.0.0, 1.1.01)',
      );
    }
  }

  /**
   * Construye el árbol jerárquico a partir de una lista plana
   */
  private construirArbol(cuentas: CuentaContable[]): CuentaContable[] {
    const mapa = new Map<number, CuentaContable>();
    const raices: CuentaContable[] = [];

    // Crear mapa
    cuentas.forEach((cuenta) => {
      cuenta.hijos = [];
      mapa.set(cuenta.id, cuenta);
    });

    // Construir árbol
    cuentas.forEach((cuenta) => {
      if (cuenta.padre_id && mapa.has(cuenta.padre_id)) {
        const padre = mapa.get(cuenta.padre_id);
        if (padre) {
          padre.hijos.push(cuenta);
        }
      } else {
        raices.push(cuenta);
      }
    });

    return raices;
  }
}

