import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banco } from './entities/banco.entity';
import { CreateBancoDto } from './dto/create-banco.dto';

@Injectable()
export class BancosService {
  constructor(
    @InjectRepository(Banco)
    private bancoRepository: Repository<Banco>,
  ) {}

  async create(createBancoDto: CreateBancoDto): Promise<Banco> {
    const banco = this.bancoRepository.create({
      ...createBancoDto,
      saldo_actual: createBancoDto.saldo_inicial || 0,
    });
    return this.bancoRepository.save(banco);
  }

  async findAll(): Promise<Banco[]> {
    return this.bancoRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Banco> {
    return this.bancoRepository.findOne({
      where: { id },
      relations: ['conciliaciones'],
    });
  }

  async update(id: number, updateData: Partial<CreateBancoDto>): Promise<Banco> {
    await this.bancoRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.bancoRepository.update(id, { activo: false });
  }

  async actualizarSaldo(bancoId: number, monto: number, tipo: 'suma' | 'resta'): Promise<void> {
    const banco = await this.findOne(bancoId);
    if (tipo === 'suma') {
      banco.saldo_actual = Number(banco.saldo_actual) + monto;
    } else {
      banco.saldo_actual = Math.max(0, Number(banco.saldo_actual) - monto);
    }
    await this.bancoRepository.save(banco);
  }
}












