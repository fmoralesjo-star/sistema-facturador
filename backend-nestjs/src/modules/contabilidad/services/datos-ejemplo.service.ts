import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsientoContable } from '../entities/asiento-contable.entity';
import { PartidaContable } from '../entities/partida-contable.entity';
import { CuentaContable } from '../entities/cuenta-contable.entity';
import { PlanCuentasService } from './plan-cuentas.service';

@Injectable()
export class DatosEjemploService {
  constructor(
    @InjectRepository(AsientoContable)
    private asientoRepository: Repository<AsientoContable>,
    @InjectRepository(PartidaContable)
    private partidaRepository: Repository<PartidaContable>,
    @InjectRepository(CuentaContable)
    private cuentaRepository: Repository<CuentaContable>,
    private planCuentasService: PlanCuentasService,
  ) {}

  /**
   * Genera datos de ejemplo para probar el sistema contable
   */
  async generarDatosEjemplo() {
    try {
      // Verificar que el plan de cuentas esté inicializado
      const cuentasExistentes = await this.cuentaRepository.count();
      if (cuentasExistentes === 0) {
        await this.planCuentasService.inicializarPlanBasico();
      }

      // Obtener cuentas necesarias
      const cuentaClientes = await this.cuentaRepository.findOne({
        where: { codigo: '1.1.02' },
      });
      const cuentaVentas = await this.cuentaRepository.findOne({
        where: { codigo: '4.1.01' },
      });
      const cuentaIVA = await this.cuentaRepository.findOne({
        where: { codigo: '2.1.02' },
      });
      const cuentaCaja = await this.cuentaRepository.findOne({
        where: { codigo: '1.1.01' },
      });

      if (!cuentaClientes || !cuentaVentas || !cuentaIVA) {
        throw new Error(
          'Cuentas contables no encontradas. Ejecute primero /api/plan-cuentas/inicializar',
        );
      }

      const asientosCreados = [];

      // ============================================
      // ASIENTO 1: Factura de $100 + IVA 15%
      // ============================================
      const fecha1 = new Date('2024-01-15');
      const asiento1 = this.asientoRepository.create({
        numero_asiento: 'AS-EJEMPLO-001',
        fecha: fecha1,
        descripcion: 'Factura Ejemplo FAC-001 - Venta de productos',
        tipo: 'VENTA',
        total_debe: 115.0,
        total_haber: 115.0,
      });
      const asiento1Guardado = await this.asientoRepository.save(asiento1);

      // Partidas del asiento 1
      await this.partidaRepository.save([
        {
          asiento_id: asiento1Guardado.id,
          cuenta_id: cuentaClientes.id,
          debe: 115.0,
          haber: 0,
          descripcion: 'Factura FAC-001 - Clientes / Cuentas por Cobrar',
        },
        {
          asiento_id: asiento1Guardado.id,
          cuenta_id: cuentaVentas.id,
          debe: 0,
          haber: 100.0,
          descripcion: 'Factura FAC-001 - Ventas',
        },
        {
          asiento_id: asiento1Guardado.id,
          cuenta_id: cuentaIVA.id,
          debe: 0,
          haber: 15.0,
          descripcion: 'Factura FAC-001 - IVA Cobrado',
        },
      ]);

      asientosCreados.push(asiento1Guardado.id);

      // ============================================
      // ASIENTO 2: Factura de $250 + IVA 15%
      // ============================================
      const fecha2 = new Date('2024-01-20');
      const asiento2 = this.asientoRepository.create({
        numero_asiento: 'AS-EJEMPLO-002',
        fecha: fecha2,
        descripcion: 'Factura Ejemplo FAC-002 - Venta de servicios',
        tipo: 'VENTA',
        total_debe: 287.5,
        total_haber: 287.5,
      });
      const asiento2Guardado = await this.asientoRepository.save(asiento2);

      await this.partidaRepository.save([
        {
          asiento_id: asiento2Guardado.id,
          cuenta_id: cuentaClientes.id,
          debe: 287.5,
          haber: 0,
          descripcion: 'Factura FAC-002 - Clientes / Cuentas por Cobrar',
        },
        {
          asiento_id: asiento2Guardado.id,
          cuenta_id: cuentaVentas.id,
          debe: 0,
          haber: 250.0,
          descripcion: 'Factura FAC-002 - Ventas',
        },
        {
          asiento_id: asiento2Guardado.id,
          cuenta_id: cuentaIVA.id,
          debe: 0,
          haber: 37.5,
          descripcion: 'Factura FAC-002 - IVA Cobrado',
        },
      ]);

      asientosCreados.push(asiento2Guardado.id);

      // ============================================
      // ASIENTO 3: Factura de $500 + IVA 15%
      // ============================================
      const fecha3 = new Date('2024-01-25');
      const asiento3 = this.asientoRepository.create({
        numero_asiento: 'AS-EJEMPLO-003',
        fecha: fecha3,
        descripcion: 'Factura Ejemplo FAC-003 - Venta mayorista',
        tipo: 'VENTA',
        total_debe: 575.0,
        total_haber: 575.0,
      });
      const asiento3Guardado = await this.asientoRepository.save(asiento3);

      await this.partidaRepository.save([
        {
          asiento_id: asiento3Guardado.id,
          cuenta_id: cuentaClientes.id,
          debe: 575.0,
          haber: 0,
          descripcion: 'Factura FAC-003 - Clientes / Cuentas por Cobrar',
        },
        {
          asiento_id: asiento3Guardado.id,
          cuenta_id: cuentaVentas.id,
          debe: 0,
          haber: 500.0,
          descripcion: 'Factura FAC-003 - Ventas',
        },
        {
          asiento_id: asiento3Guardado.id,
          cuenta_id: cuentaIVA.id,
          debe: 0,
          haber: 75.0,
          descripcion: 'Factura FAC-003 - IVA Cobrado',
        },
      ]);

      asientosCreados.push(asiento3Guardado.id);

      // ============================================
      // ASIENTO 4: Cobro de factura (si hay cuenta de caja)
      // ============================================
      if (cuentaCaja) {
        const fecha4 = new Date('2024-01-28');
        const asiento4 = this.asientoRepository.create({
          numero_asiento: 'AS-EJEMPLO-004',
          fecha: fecha4,
          descripcion: 'Cobro de factura FAC-001',
          tipo: 'ACTIVO',
          total_debe: 115.0,
          total_haber: 115.0,
        });
        const asiento4Guardado = await this.asientoRepository.save(asiento4);

        await this.partidaRepository.save([
          {
            asiento_id: asiento4Guardado.id,
            cuenta_id: cuentaCaja.id,
            debe: 115.0,
            haber: 0,
            descripcion: 'Cobro FAC-001 - Caja',
          },
          {
            asiento_id: asiento4Guardado.id,
            cuenta_id: cuentaClientes.id,
            debe: 0,
            haber: 115.0,
            descripcion: 'Cobro FAC-001 - Clientes',
          },
        ]);

        asientosCreados.push(asiento4Guardado.id);
      }

      return {
        success: true,
        message: 'Datos de ejemplo generados exitosamente',
        asientos_creados: asientosCreados.length,
        asientos: asientosCreados,
        resumen: {
          total_facturas_simuladas: 3,
          total_ventas: 850.0,
          total_iva: 127.5,
          total_cobros: cuentaCaja ? 115.0 : 0,
        },
      };
    } catch (error) {
      throw new Error(
        `Error al generar datos de ejemplo: ${error.message}`,
      );
    }
  }

  /**
   * Limpia los datos de ejemplo (solo asientos que comienzan con AS-EJEMPLO)
   */
  async limpiarDatosEjemplo() {
    try {
      // Buscar asientos de ejemplo
      const asientosEjemplo = await this.asientoRepository.find({
        where: {},
      });

      const asientosAEliminar = asientosEjemplo.filter(
        (a) => a.numero_asiento.startsWith('AS-EJEMPLO-'),
      );

      let eliminados = 0;

      for (const asiento of asientosAEliminar) {
        // Eliminar partidas primero (cascade debería hacerlo, pero por seguridad)
        await this.partidaRepository.delete({ asiento_id: asiento.id });
        await this.asientoRepository.remove(asiento);
        eliminados++;
      }

      return {
        success: true,
        message: 'Datos de ejemplo eliminados',
        asientos_eliminados: eliminados,
      };
    } catch (error) {
      throw new Error(`Error al limpiar datos de ejemplo: ${error.message}`);
    }
  }
}

