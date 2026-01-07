import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConciliacionBancaria } from './entities/conciliacion-bancaria.entity';
import { MovimientoBancarioExtracto } from './entities/movimiento-bancario-extracto.entity';
import { CreateConciliacionDto } from './dto/create-conciliacion.dto';
import { BancosService } from '../bancos/bancos.service';
import { ContabilidadService } from '../contabilidad/contabilidad.service';
import { ConciliacionIAService } from './conciliacion-ia.service';

@Injectable()
export class ConciliacionesService {
  constructor(
    @InjectRepository(ConciliacionBancaria)
    private conciliacionRepository: Repository<ConciliacionBancaria>,
    @InjectRepository(MovimientoBancarioExtracto)
    private extractoRepository: Repository<MovimientoBancarioExtracto>,
    private bancosService: BancosService,
    private contabilidadService: ContabilidadService,
    private conciliacionIAService: ConciliacionIAService,
  ) { }

  async create(createConciliacionDto: CreateConciliacionDto): Promise<ConciliacionBancaria> {
    const conciliacion = this.conciliacionRepository.create({
      ...createConciliacionDto,
      fecha: new Date(createConciliacionDto.fecha),
      fecha_valor: createConciliacionDto.fecha_valor ? new Date(createConciliacionDto.fecha_valor) : null,
    });

    const conciliacionGuardada = await this.conciliacionRepository.save(conciliacion);

    // Actualizar saldo del banco
    if (createConciliacionDto.tipo === 'DEPOSITO' || createConciliacionDto.tipo === 'TRANSFERENCIA_ENTRADA') {
      await this.bancosService.actualizarSaldo(createConciliacionDto.banco_id, createConciliacionDto.monto, 'suma');
    } else if (createConciliacionDto.tipo === 'RETIRO' || createConciliacionDto.tipo === 'TRANSFERENCIA_SALIDA') {
      await this.bancosService.actualizarSaldo(createConciliacionDto.banco_id, createConciliacionDto.monto, 'resta');
    }

    // Generar asiento contable automático
    try {
      if (createConciliacionDto.tipo === 'DEPOSITO' || createConciliacionDto.tipo === 'TRANSFERENCIA_ENTRADA') {
        await this.contabilidadService.crearAsientoTransferencia({
          origen: 'CLIENTES',
          destino: 'BANCOS',
          monto: createConciliacionDto.monto,
          motivo: createConciliacionDto.descripcion || 'Depósito bancario',
          fecha: conciliacionGuardada.fecha,
        });
      } else if (createConciliacionDto.tipo === 'RETIRO' || createConciliacionDto.tipo === 'TRANSFERENCIA_SALIDA') {
        await this.contabilidadService.crearAsientoTransferencia({
          origen: 'BANCOS',
          destino: 'Caja General',
          monto: createConciliacionDto.monto,
          motivo: createConciliacionDto.descripcion || 'Retiro bancario',
          fecha: conciliacionGuardada.fecha,
        });
      }
    } catch (error) {
      console.error('Error al crear asiento contable para conciliación:', error);
    }

    return conciliacionGuardada;
  }

  async findAll(): Promise<ConciliacionBancaria[]> {
    return this.conciliacionRepository.find({
      relations: ['banco', 'factura'],
      order: { fecha: 'DESC' },
    });
  }

  async findByBanco(bancoId: number): Promise<ConciliacionBancaria[]> {
    return this.conciliacionRepository.find({
      where: { banco_id: bancoId },
      relations: ['banco', 'factura'],
      order: { fecha: 'DESC' },
    });
  }

  async findByFactura(facturaId: number): Promise<ConciliacionBancaria[]> {
    return this.conciliacionRepository.find({
      where: { factura_id: facturaId },
      relations: ['banco', 'factura'],
    });
  }

  async findAllExtracto(bancoId: number): Promise<MovimientoBancarioExtracto[]> {
    return this.extractoRepository.find({
      where: { banco_id: bancoId },
      order: { fecha: 'ASC' }
    });
  }

  async findOne(id: number): Promise<ConciliacionBancaria> {
    return this.conciliacionRepository.findOne({
      where: { id },
      relations: ['banco', 'factura'],
    });
  }

  async update(id: number, updateData: Partial<CreateConciliacionDto>): Promise<ConciliacionBancaria> {
    await this.conciliacionRepository.update(id, {
      ...updateData,
      fecha: updateData.fecha ? new Date(updateData.fecha) : undefined,
      fecha_valor: updateData.fecha_valor ? new Date(updateData.fecha_valor) : undefined,
    });
    return this.findOne(id);
  }

  async conciliar(id: number): Promise<ConciliacionBancaria> {
    await this.conciliacionRepository.update(id, {
      conciliado: true,
      fecha_conciliacion: new Date(),
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.conciliacionRepository.delete(id);
  }

  async sincronizarConFactura(facturaId: number, pagos: any[]): Promise<void> {
    // Logic existing... se mantiene igual
    for (const pago of pagos) {
      let tipoMovimiento = 'DEPOSITO';
      if (pago.metodoPago === 'TRANSFERENCIA' || pago.metodoPago === 'TRANSFERENCIA_ENTRADA') {
        tipoMovimiento = 'TRANSFERENCIA_ENTRADA';
      } else if (pago.metodoPago === 'TARJETA_DEBITO' || pago.metodoPago === 'TARJETA_CREDITO') {
        tipoMovimiento = 'TARJETA';
      } else if (pago.metodoPago === 'EFECTIVO') {
        continue;
      }

      let bancoId = pago.banco_id;
      if (!bancoId) {
        const bancos = await this.bancosService.findAll();
        if (bancos.length > 0) {
          bancoId = bancos[0].id;
        } else {
          continue;
        }
      }

      await this.create({
        banco_id: bancoId,
        factura_id: facturaId,
        fecha: new Date().toISOString(),
        monto: pago.monto,
        tipo: tipoMovimiento,
        forma_pago: pago.codigo || pago.formaPago,
        metodo_pago: pago.metodoPago,
        descripcion: `Pago de factura - ${pago.tipoPago || pago.descripcion || 'Pago registrado'}`,
        conciliado: false,
      });
    }
  }

  // --- NUEVA LÓGICA: IMPORTACIÓN DE EXTRACTOS ---

  async importarExtracto(bancoId: number, datosCSV: string): Promise<{ importados: number, duplicados: number }> {
    const lineas = datosCSV.split('\n');
    let importados = 0;
    let duplicados = 0;

    // Asumimos formato CSV simple: fecha(YYYY-MM-DD),descripcion,monto,referencia
    // Ignoramos primera linea si es cabecera
    const startIndex = lineas[0].toLowerCase().includes('fecha') ? 1 : 0;

    for (let i = startIndex; i < lineas.length; i++) {
      const linea = lineas[i].trim();
      if (!linea) continue;

      const [fechaStr, descripcion, montoStr, referencia] = linea.split(',');

      if (!fechaStr || !montoStr) continue;

      const monto = parseFloat(montoStr);
      const fecha = new Date(fechaStr); // Asegurarse formato ISO

      // Verificar duplicados (misma fecha, monto y referencia)
      const existe = await this.extractoRepository.findOne({
        where: {
          banco_id: bancoId,
          fecha: fecha,
          monto: monto,
          referencia: referencia || undefined // TypeORM trata null vs undefined
        }
      });

      if (existe) {
        duplicados++;
        continue;
      }

      const movimiento = this.extractoRepository.create({
        banco_id: bancoId,
        fecha: fecha,
        descripcion: descripcion || 'Movimiento importado',
        monto: monto,
        referencia: referencia || null,
        conciliado: false
      });

      await this.extractoRepository.save(movimiento);
      importados++;
    }

    // Auto-conciliar después de importar
    await this.conciliarAutomatico(bancoId);

    return { importados, duplicados };
  }

  async conciliarAutomatico(bancoId: number): Promise<number> {
    // Buscar movimientos del extracto NO conciliados
    const movimientosExtracto = await this.extractoRepository.find({
      where: { banco_id: bancoId, conciliado: false }
    });

    // Buscar movimientos del sistema NO conciliados para ese banco
    const movimientosSistema = await this.conciliacionRepository.find({
      where: { banco_id: bancoId, conciliado: false }
    });

    let conciliadosCount = 0;

    for (const movExtracto of movimientosExtracto) {
      // Estrategia 1: Match Exacto por Monto y Fecha
      // Permitimos un margen de error de 1-2 días en fecha por tiempos de compensación
      const match = movimientosSistema.find(movSistema => {
        const diffDias = Math.abs((new Date(movSistema.fecha).getTime() - new Date(movExtracto.fecha).getTime()) / (1000 * 3600 * 24));
        return Math.abs(Number(movSistema.monto) - Number(movExtracto.monto)) < 0.01 && diffDias <= 2;
      });

      if (match) {
        // Marcar ambos como conciliados
        match.conciliado = true;
        match.fecha_conciliacion = new Date();
        match.referencia = match.referencia || movExtracto.referencia; // Completar referencia si falta

        movExtracto.conciliado = true;
        movExtracto.conciliacion_bancaria_id = match.id;

        await this.conciliacionRepository.save(match);
        await this.extractoRepository.save(movExtracto);

        conciliadosCount++;

        // Remover de la lista en memoria para no volver a matchear
        const index = movimientosSistema.indexOf(match);
        if (index > -1) movimientosSistema.splice(index, 1);
      }
    }

    return conciliadosCount;
  }

  // Métodos de IA
  async procesarExtractoIA(data: any[], bancoId: number) {
    return await this.conciliacionIAService.procesarExtracto(data, bancoId);
  }

  async getPendientesIA(bancoId?: number) {
    return await this.conciliacionIAService.getPendientes(bancoId);
  }

  async getSugerenciasIA(transaccionId: number) {
    return await this.conciliacionIAService.sugerirEmparejamientos(transaccionId);
  }

  async confirmarMatchIA(transaccionId: number, conciliacionId: number) {
    return await this.conciliacionIAService.confirmarEmparejamiento(transaccionId, conciliacionId);
  }

  async getEstadisticasIA(bancoId?: number) {
    return await this.conciliacionIAService.getEstadisticas(bancoId);
  }
}
