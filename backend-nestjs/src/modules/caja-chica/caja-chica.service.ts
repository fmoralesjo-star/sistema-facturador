import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CajaChicaMovimiento } from './entities/caja-chica-movimiento.entity';
import { CreateCajaChicaMovimientoDto } from './dto/create-caja-chica-movimiento.dto';

@Injectable()
export class CajaChicaService {
    constructor(
        @InjectRepository(CajaChicaMovimiento)
        private cajaChicaRepository: Repository<CajaChicaMovimiento>,
    ) { }

    async registrarMovimiento(createDto: CreateCajaChicaMovimientoDto): Promise<CajaChicaMovimiento> {
        // Obtener saldo actual
        const saldoActual = await this.obtenerSaldoActual(createDto.punto_venta_id);

        // Calcular nuevo saldo
        // NOTA: Si es INGRESO, suma. Si es GASTO, resta.
        // El monto siempre se guarda positivo en la DB, el tipo define la operación.
        const monto = Number(createDto.monto);
        let nuevoSaldo = 0;

        if (createDto.tipo === 'INGRESO') {
            nuevoSaldo = saldoActual + monto;
        } else {
            nuevoSaldo = saldoActual - monto;
        }

        const movimiento = this.cajaChicaRepository.create({
            ...createDto,
            monto: monto,
            saldo_resultante: nuevoSaldo
        });

        return await this.cajaChicaRepository.save(movimiento);
    }

    async obtenerSaldoActual(puntoVentaId: number): Promise<number> {
        const ultimoMovimiento = await this.cajaChicaRepository.findOne({
            where: { punto_venta_id: puntoVentaId },
            order: { id: 'DESC' }
        });

        return ultimoMovimiento ? Number(ultimoMovimiento.saldo_resultante) : 0;
    }

    async obtenerHistorial(puntoVentaId: number, fechaInicio?: string, fechaFin?: string) {
        const query = this.cajaChicaRepository.createQueryBuilder('movimiento')
            .leftJoinAndSelect('movimiento.usuario', 'usuario')
            .where('movimiento.punto_venta_id = :puntoVentaId', { puntoVentaId })
            .orderBy('movimiento.id', 'DESC');

        if (fechaInicio && fechaFin) {
            // Ajustar fechas para incluir todo el día
            const inicio = new Date(fechaInicio);
            inicio.setHours(0, 0, 0, 0);

            const fin = new Date(fechaFin);
            fin.setHours(23, 59, 59, 999);

            query.andWhere('movimiento.fecha BETWEEN :inicio AND :fin', { inicio, fin });
        } else {
            // Por defecto últimos 20 movimientos si no hay filtro
            query.take(20);
        }

        return await query.getMany();
    }
}
