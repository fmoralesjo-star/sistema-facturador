import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { FirestoreService } from '../firebase/firestore.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { CreateProductoDto, UpdateProductoDto } from './productos.service';

@Injectable()
export class ProductosFirestoreService {
  private readonly collectionName = 'productos';

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
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    const producto = await this.firestoreService.findOne(this.collectionName, id);
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return producto;
  }

  async findByCodigo(codigo: string) {
    if (!this.firestoreService.isAvailable()) {
      return null;
    }
    const productos = await this.firestoreService.findByField(
      this.collectionName,
      'codigo',
      codigo,
    );
    return productos.length > 0 ? productos[0] : null;
  }

  async create(createDto: CreateProductoDto) {
    if (!this.firestoreService.isAvailable()) {
      throw new Error('Firestore no está disponible');
    }

    // Verificar si ya existe por código
    if (createDto.codigo) {
      const existe = await this.findByCodigo(createDto.codigo);
      if (existe) {
        throw new Error(`Ya existe un producto con código "${createDto.codigo}"`);
      }
    }

    const productoData = {
      ...createDto,
      stock: createDto.stock || 0,
      fecha_movimiento: createDto.fecha_movimiento
        ? (typeof createDto.fecha_movimiento === 'string'
          ? new Date(createDto.fecha_movimiento)
          : createDto.fecha_movimiento)
        : new Date(),
      tipo_impuesto: '15',
      activo: true,
    };

    const id = await this.firestoreService.create(this.collectionName, productoData);
    const producto = { id, ...productoData };
    this.eventsGateway.emitProductoCreado(producto);
    return producto;
  }

  async update(id: string, updateDto: UpdateProductoDto) {
    if (!this.firestoreService.isAvailable()) {
      throw new Error('Firestore no está disponible');
    }

    await this.findOne(id); // Verificar que existe

    const updateData: any = { ...updateDto };
    if (updateDto.fecha_movimiento) {
      updateData.fecha_movimiento = typeof updateDto.fecha_movimiento === 'string'
        ? new Date(updateDto.fecha_movimiento)
        : updateDto.fecha_movimiento;
    }

    await this.firestoreService.update(this.collectionName, id, updateData);
    const producto = await this.findOne(id);
    this.eventsGateway.emitProductoActualizado(producto);
    return producto;
  }

  async remove(id: string) {
    if (!this.firestoreService.isAvailable()) {
      throw new Error('Firestore no está disponible');
    }

    await this.findOne(id); // Verificar que existe
    await this.firestoreService.delete(this.collectionName, id);
    this.eventsGateway.emitProductoEliminado(id);
    return { success: true };
  }

  async crearProductoEjemplo() {
    try {
      if (!this.firestoreService.isAvailable()) {
        throw new Error('Firestore no está disponible');
      }

      // Verificar si ya existe
      const existe = await this.findByCodigo('PRENDA-001');
      if (existe) {
        return {
          success: false,
          message: 'El producto de ejemplo ya existe (Código: PRENDA-001)',
          producto: existe,
        };
      }

      // Crear producto de ejemplo
      const productoData = {
        codigo: 'PRENDA-001',
        sku: 'PRENDA-XS-001',
        nombre: 'Camiseta Básica - Talla XS',
        descripcion: 'Camiseta de algodón 100%, color blanco, talla XS. Ideal para uso diario. Material suave y cómodo.',
        precio: 25.99,
        stock: 45,
        tipo_impuesto: '15',
        activo: true,
        punto_reorden: 30,
        stock_seguridad: 15,
        tiempo_entrega_dias: 7,
        costo_promedio: 15.50,
      };

      const id = await this.firestoreService.create(this.collectionName, productoData);
      const producto = { id, ...productoData };
      this.eventsGateway.emitProductoCreado(producto);

      return {
        success: true,
        message: 'Producto de ejemplo creado exitosamente',
        producto,
      };
    } catch (error) {
      console.error('Error al crear producto de ejemplo:', error);
      throw error;
    }
  }
}

