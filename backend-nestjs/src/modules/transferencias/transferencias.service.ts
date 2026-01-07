import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transferencia } from './entities/transferencia.entity';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';
import { Producto } from '../productos/entities/producto.entity';
import { InventarioService } from '../inventario/inventario.service';
import { ContabilidadService } from '../contabilidad/contabilidad.service';

@Injectable()
export class TransferenciasService {
  constructor(
    @InjectRepository(Transferencia)
    private transferenciaRepository: Repository<Transferencia>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    @Inject(forwardRef(() => InventarioService))
    private inventarioService: InventarioService,
    @Inject(forwardRef(() => ContabilidadService))
    private contabilidadService: ContabilidadService,
  ) { }

  async create(createDto: CreateTransferenciaDto) {
    const transferencia = this.transferenciaRepository.create({
      ...createDto,
      fecha: createDto.fecha ? new Date(createDto.fecha) : new Date(),
      estado: createDto.estado || 'pendiente',
    });

    const transferenciaGuardada = await this.transferenciaRepository.save(transferencia);

    // Si es transferencia de dinero, registrar asiento contable
    if (createDto.tipo === 'dinero' && createDto.monto > 0) {
      try {
        await this.contabilidadService.crearAsientoTransferencia({
          origen: createDto.origen,
          destino: createDto.destino,
          monto: createDto.monto,
          motivo: createDto.motivo || 'Transferencia de dinero',
          fecha: transferenciaGuardada.fecha,
        });
      } catch (error) {
        console.error('Error al crear asiento contable para transferencia:', error);
        // No bloqueamos la transferencia si el asiento falla
      }
    }

    // Si es transferencia de producto, registrar movimiento de inventario
    if (createDto.tipo === 'producto' && createDto.producto_id && createDto.cantidad) {

      // Si tenemos IDs de puntos de venta, usamos la nueva lógica
      if (createDto.origen_id && createDto.destino_id) {
        await this.inventarioService.transferirStock(
          createDto.producto_id,
          createDto.origen_id,
          createDto.destino_id,
          createDto.cantidad
        );
      } else {
        // Lógica antigua (fallback)
        // Registrar salida en origen
        await this.inventarioService.registrarMovimiento({
          producto_id: createDto.producto_id,
          tipo: 'SALIDA',
          cantidad: createDto.cantidad,
          motivo: `Transferencia a ${createDto.destino}`,
          observaciones: `Transferencia ID: ${transferenciaGuardada.id}`,
          punto_venta_id: createDto.origen_id // Optional
        });

        // Registrar entrada en destino
        await this.inventarioService.registrarMovimiento({
          producto_id: createDto.producto_id,
          tipo: 'ENTRADA',
          cantidad: createDto.cantidad,
          motivo: `Transferencia desde ${createDto.origen}`,
          observaciones: `Transferencia ID: ${transferenciaGuardada.id}`,
          punto_venta_id: createDto.destino_id // Optional
        });
      }
    }

    return transferenciaGuardada;
  }

  async findAll() {
    return this.transferenciaRepository.find({
      relations: ['producto'],
      order: { fecha: 'DESC', id: 'DESC' },
    });
  }

  async findOne(id: number) {
    return this.transferenciaRepository.findOne({
      where: { id },
      relations: ['producto'],
    });
  }
}

