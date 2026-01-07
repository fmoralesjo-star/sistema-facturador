import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartidaContable } from '../entities/partida-contable.entity';
import { CuentaContable } from '../entities/cuenta-contable.entity';
import { AsientoContable } from '../entities/asiento-contable.entity';

export interface BalanceGeneral {
  activos: {
    total: number;
    cuentas: Array<{
      codigo: string;
      nombre: string;
      saldo: number;
    }>;
  };
  pasivos: {
    total: number;
    cuentas: Array<{
      codigo: string;
      nombre: string;
      saldo: number;
    }>;
  };
  patrimonio: {
    total: number;
    cuentas: Array<{
      codigo: string;
      nombre: string;
      saldo: number;
    }>;
  };
  ecuacion: {
    activo_total: number;
    pasivo_patrimonio_total: number;
    balanceado: boolean;
    diferencia: number;
  };
}

export interface EstadoPerdidasGanancias {
  ingresos: {
    total: number;
    cuentas: Array<{
      codigo: string;
      nombre: string;
      saldo: number;
    }>;
  };
  costos: {
    total: number;
    cuentas: Array<{
      codigo: string;
      nombre: string;
      saldo: number;
    }>;
  };
  gastos: {
    total: number;
    cuentas: Array<{
      codigo: string;
      nombre: string;
      saldo: number;
    }>;
  };
  utilidad_bruta: number; // Ingresos - Costos
  utilidad_neta: number; // Ingresos - Costos - Gastos
}

export interface LibroMayorCuenta {
  cuenta_id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  saldo_inicial: number;
  movimientos: Array<{
    fecha: Date;
    numero_asiento: string;
    descripcion: string;
    debe: number;
    haber: number;
    saldo_acumulado: number;
  }>;
  saldo_final: number;
}

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(PartidaContable)
    private partidaRepository: Repository<PartidaContable>,
    @InjectRepository(CuentaContable)
    private cuentaRepository: Repository<CuentaContable>,
    @InjectRepository(AsientoContable)
    private asientoRepository: Repository<AsientoContable>,
  ) {}

  /**
   * Genera el Balance General
   * Fórmula: Activo = Pasivo + Patrimonio
   */
  async generarBalanceGeneral(fechaCorte?: Date): Promise<BalanceGeneral> {
    const fecha = fechaCorte || new Date();

    // Obtener saldos de cuentas de ACTIVO
    const activos = await this.obtenerSaldosPorTipo('ACTIVO', fecha);
    
    // Obtener saldos de cuentas de PASIVO
    const pasivos = await this.obtenerSaldosPorTipo('PASIVO', fecha);
    
    // Obtener saldos de cuentas de PATRIMONIO
    const patrimonio = await this.obtenerSaldosPorTipo('PATRIMONIO', fecha);

    const totalActivos = activos.reduce((sum, c) => sum + c.saldo, 0);
    const totalPasivos = pasivos.reduce((sum, c) => sum + c.saldo, 0);
    const totalPatrimonio = patrimonio.reduce((sum, c) => sum + c.saldo, 0);
    const totalPasivoPatrimonio = totalPasivos + totalPatrimonio;

    return {
      activos: {
        total: totalActivos,
        cuentas: activos,
      },
      pasivos: {
        total: totalPasivos,
        cuentas: pasivos,
      },
      patrimonio: {
        total: totalPatrimonio,
        cuentas: patrimonio,
      },
      ecuacion: {
        activo_total: totalActivos,
        pasivo_patrimonio_total: totalPasivoPatrimonio,
        balanceado: Math.abs(totalActivos - totalPasivoPatrimonio) < 0.01,
        diferencia: totalActivos - totalPasivoPatrimonio,
      },
    };
  }

  /**
   * Genera el Estado de Pérdidas y Ganancias (P&L)
   * Fórmula: Utilidad = Ingresos - Costos - Gastos
   */
  async generarEstadoPerdidasGanancias(
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<EstadoPerdidasGanancias> {
    // Obtener ingresos
    const ingresos = await this.obtenerSaldosPorTipoYFecha(
      'INGRESO',
      fechaInicio,
      fechaFin,
    );

    // Obtener costos
    const costos = await this.obtenerSaldosPorTipoYFecha(
      'COSTO',
      fechaInicio,
      fechaFin,
    );

    // Obtener gastos
    const gastos = await this.obtenerSaldosPorTipoYFecha(
      'EGRESO',
      fechaInicio,
      fechaFin,
    );

    const totalIngresos = ingresos.reduce((sum, c) => sum + c.saldo, 0);
    const totalCostos = costos.reduce((sum, c) => sum + c.saldo, 0);
    const totalGastos = gastos.reduce((sum, c) => sum + c.saldo, 0);

    return {
      ingresos: {
        total: totalIngresos,
        cuentas: ingresos,
      },
      costos: {
        total: totalCostos,
        cuentas: costos,
      },
      gastos: {
        total: totalGastos,
        cuentas: gastos,
      },
      utilidad_bruta: totalIngresos - totalCostos,
      utilidad_neta: totalIngresos - totalCostos - totalGastos,
    };
  }

  /**
   * Genera el Libro Mayor para una cuenta específica
   * Muestra todos los movimientos (debe/haber) y el saldo acumulado
   */
  async generarLibroMayor(
    cuentaId: number,
    fechaInicio?: Date,
    fechaFin?: Date,
  ): Promise<LibroMayorCuenta> {
    const cuenta = await this.cuentaRepository.findOne({
      where: { id: cuentaId },
    });

    if (!cuenta) {
      throw new Error(`Cuenta con ID ${cuentaId} no encontrada`);
    }

    // Construir query para obtener partidas
    let query = this.partidaRepository
      .createQueryBuilder('partida')
      .innerJoin('partida.asiento', 'asiento')
      .where('partida.cuenta_id = :cuentaId', { cuentaId })
      .orderBy('asiento.fecha', 'ASC')
      .addOrderBy('asiento.id', 'ASC');

    if (fechaInicio) {
      query = query.andWhere('asiento.fecha >= :fechaInicio', { fechaInicio });
    }

    if (fechaFin) {
      query = query.andWhere('asiento.fecha <= :fechaFin', { fechaFin });
    }

    const partidas = await query
      .select([
        'partida.id',
        'partida.debe',
        'partida.haber',
        'partida.descripcion',
        'asiento.fecha',
        'asiento.numero_asiento',
        'asiento.descripcion',
      ])
      .getRawMany();

    // Calcular saldo inicial (antes de la fecha de inicio si se especifica)
    let saldoInicial = 0;
    if (fechaInicio) {
      const saldoAnterior = await this.partidaRepository
        .createQueryBuilder('partida')
        .innerJoin('partida.asiento', 'asiento')
        .where('partida.cuenta_id = :cuentaId', { cuentaId })
        .andWhere('asiento.fecha < :fechaInicio', { fechaInicio })
        .select('SUM(partida.debe)', 'total_debe')
        .addSelect('SUM(partida.haber)', 'total_haber')
        .getRawOne();

      const debeAnterior = parseFloat(saldoAnterior?.total_debe || 0);
      const haberAnterior = parseFloat(saldoAnterior?.total_haber || 0);

      // El saldo depende del tipo de cuenta
      if (
        cuenta.tipo === 'ACTIVO' ||
        cuenta.tipo === 'COSTO' ||
        cuenta.tipo === 'EGRESO'
      ) {
        saldoInicial = debeAnterior - haberAnterior;
      } else {
        saldoInicial = haberAnterior - debeAnterior;
      }
    }

    // Construir movimientos con saldo acumulado
    let saldoAcumulado = saldoInicial;
    const movimientos = partidas.map((partida) => {
      const debe = parseFloat(partida.partida_debe || 0);
      const haber = parseFloat(partida.partida_haber || 0);

      // Calcular saldo según tipo de cuenta
      if (
        cuenta.tipo === 'ACTIVO' ||
        cuenta.tipo === 'COSTO' ||
        cuenta.tipo === 'EGRESO'
      ) {
        saldoAcumulado = saldoAcumulado + debe - haber;
      } else {
        saldoAcumulado = saldoAcumulado - debe + haber;
      }

      return {
        fecha: partida.asiento_fecha,
        numero_asiento: partida.asiento_numero_asiento,
        descripcion:
          partida.partida_descripcion || partida.asiento_descripcion,
        debe,
        haber,
        saldo_acumulado: saldoAcumulado,
      };
    });

    return {
      cuenta_id: cuenta.id,
      codigo: cuenta.codigo,
      nombre: cuenta.nombre,
      tipo: cuenta.tipo,
      saldo_inicial: saldoInicial,
      movimientos,
      saldo_final: saldoAcumulado,
    };
  }

  /**
   * Obtiene saldos de cuentas por tipo hasta una fecha específica
   */
  private async obtenerSaldosPorTipo(
    tipo: string,
    fechaCorte: Date,
  ): Promise<Array<{ codigo: string; nombre: string; saldo: number }>> {
    const cuentas = await this.cuentaRepository.find({
      where: { tipo, activa: true },
      order: { codigo: 'ASC' },
    });

    const saldos = await Promise.all(
      cuentas.map(async (cuenta) => {
        const resultado = await this.partidaRepository
          .createQueryBuilder('partida')
          .innerJoin('partida.asiento', 'asiento')
          .where('partida.cuenta_id = :cuentaId', { cuentaId: cuenta.id })
          .andWhere('asiento.fecha <= :fechaCorte', { fechaCorte })
          .select('SUM(partida.debe)', 'total_debe')
          .addSelect('SUM(partida.haber)', 'total_haber')
          .getRawOne();

        const totalDebe = parseFloat(resultado?.total_debe || 0);
        const totalHaber = parseFloat(resultado?.total_haber || 0);

        // Calcular saldo según tipo de cuenta
        let saldo = 0;
        if (tipo === 'ACTIVO' || tipo === 'COSTO' || tipo === 'EGRESO') {
          saldo = totalDebe - totalHaber;
        } else {
          saldo = totalHaber - totalDebe;
        }

        return {
          codigo: cuenta.codigo,
          nombre: cuenta.nombre,
          saldo,
        };
      }),
    );

    // Filtrar cuentas con saldo (excluir ceros)
    return saldos.filter((s) => Math.abs(s.saldo) > 0.01);
  }

  /**
   * Obtiene saldos de cuentas por tipo en un rango de fechas
   */
  private async obtenerSaldosPorTipoYFecha(
    tipo: string,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<Array<{ codigo: string; nombre: string; saldo: number }>> {
    const cuentas = await this.cuentaRepository.find({
      where: { tipo, activa: true },
      order: { codigo: 'ASC' },
    });

    const saldos = await Promise.all(
      cuentas.map(async (cuenta) => {
        const resultado = await this.partidaRepository
          .createQueryBuilder('partida')
          .innerJoin('partida.asiento', 'asiento')
          .where('partida.cuenta_id = :cuentaId', { cuentaId: cuenta.id })
          .andWhere('asiento.fecha >= :fechaInicio', { fechaInicio })
          .andWhere('asiento.fecha <= :fechaFin', { fechaFin })
          .select('SUM(partida.debe)', 'total_debe')
          .addSelect('SUM(partida.haber)', 'total_haber')
          .getRawOne();

        const totalDebe = parseFloat(resultado?.total_debe || 0);
        const totalHaber = parseFloat(resultado?.total_haber || 0);

        // Calcular saldo según tipo de cuenta
        let saldo = 0;
        if (tipo === 'ACTIVO' || tipo === 'COSTO' || tipo === 'EGRESO') {
          saldo = totalDebe - totalHaber;
        } else {
          saldo = totalHaber - totalDebe;
        }

        return {
          codigo: cuenta.codigo,
          nombre: cuenta.nombre,
          saldo,
        };
      }),
    );

    // Filtrar cuentas con saldo (excluir ceros)
    return saldos.filter((s) => Math.abs(s.saldo) > 0.01);
  }

  /**
   * Obtiene lista de cuentas para seleccionar en Libro Mayor
   */
  async obtenerCuentasParaLibroMayor(): Promise<
    Array<{ id: number; codigo: string; nombre: string; tipo: string }>
  > {
    const cuentas = await this.cuentaRepository.find({
      where: { permite_movimiento: true },
      order: { codigo: 'ASC' },
    });

    return cuentas.map((c) => ({
      id: c.id,
      codigo: c.codigo,
      nombre: c.nombre,
      tipo: c.tipo,
    }));
  }
}

