import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { FirestoreService } from '../firebase/firestore.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { CreateClienteDto, UpdateClienteDto } from './clientes.service';

@Injectable()
export class ClientesFirestoreService {
  private readonly collectionName = 'clientes';

  constructor(
    private firestoreService: FirestoreService,
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway,
  ) {
    // La verificación se hace de forma lazy cuando se use el servicio
    // para evitar warnings prematuros antes de que Firebase se inicialice
  }

  async findAll() {
    if (!this.firestoreService.isAvailable()) {
      return [];
    }
    return this.firestoreService.findAll<any>(
      this.collectionName,
      undefined,
      { field: 'nombre', direction: 'asc' },
    );
  }

  async findOne(id: string) {
    if (!this.firestoreService.isAvailable()) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    const cliente = await this.firestoreService.findOne(this.collectionName, id);
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return cliente;
  }

  async findByRuc(ruc: string) {
    if (!this.firestoreService.isAvailable()) {
      return null;
    }
    const clientes = await this.firestoreService.findByField(
      this.collectionName,
      'ruc',
      ruc,
    );
    return clientes.length > 0 ? clientes[0] : null;
  }

  async create(createDto: CreateClienteDto) {
    if (!this.firestoreService.isAvailable()) {
      throw new Error('Firestore no está disponible');
    }

    // Verificar si ya existe por RUC
    if (createDto.ruc) {
      const existe = await this.findByRuc(createDto.ruc);
      if (existe) {
        throw new Error(`Ya existe un cliente con RUC "${createDto.ruc}"`);
      }
    }

    const id = await this.firestoreService.create(this.collectionName, createDto);
    const cliente = { id, ...createDto };
    this.eventsGateway.emitClienteCreado(cliente);
    return cliente;
  }

  async update(id: string, updateDto: UpdateClienteDto) {
    if (!this.firestoreService.isAvailable()) {
      throw new Error('Firestore no está disponible');
    }

    await this.findOne(id); // Verificar que existe
    await this.firestoreService.update(this.collectionName, id, updateDto);
    const cliente = await this.findOne(id);
    this.eventsGateway.emitClienteActualizado(cliente);
    return cliente;
  }

  async remove(id: string) {
    if (!this.firestoreService.isAvailable()) {
      throw new Error('Firestore no está disponible');
    }

    await this.findOne(id); // Verificar que existe
    await this.firestoreService.delete(this.collectionName, id);
    return { success: true };
  }
}

