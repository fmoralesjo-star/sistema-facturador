import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ubicacion } from './entities/ubicacion.entity';
import { ProductoUbicacion } from './entities/producto-ubicacion.entity';
import { Producto } from '../productos/entities/producto.entity';

export class CreateUbicacionDto {
  nombre: string;
  codigo?: string;
  tipo?: string;
  descripcion?: string;
  direccion?: string;
}

export class UpdateUbicacionDto {
  nombre?: string;
  codigo?: string;
  tipo?: string;
  descripcion?: string;
  direccion?: string;
  activa?: boolean;
}

export class AsignarProductoUbicacionDto {
  producto_id: number;
  ubicacion_id: number;
  stock: number;
  stock_minimo?: number;
  stock_maximo?: number;
  estado_stock?: string; // DISPONIBLE, RESERVADO, DANADO_MERMA, EN_TRANSITO
  observaciones?: string;
}

@Injectable()
export class UbicacionesService {
  constructor(
    @InjectRepository(Ubicacion)
    private ubicacionRepository: Repository<Ubicacion>,
    @InjectRepository(ProductoUbicacion)
    private productoUbicacionRepository: Repository<ProductoUbicacion>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
  ) {}

  async findAll() {
    return this.ubicacionRepository.find({
      where: { activa: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number) {
    const ubicacion = await this.ubicacionRepository.findOne({
      where: { id },
      relations: ['productosUbicacion', 'productosUbicacion.producto'],
    });
    if (!ubicacion) {
      throw new NotFoundException(`Ubicación con ID ${id} no encontrada`);
    }
    return ubicacion;
  }

  async create(createDto: CreateUbicacionDto) {
    const ubicacion = this.ubicacionRepository.create({
      ...createDto,
      tipo: createDto.tipo || 'BODEGA',
    });
    return this.ubicacionRepository.save(ubicacion);
  }

  async update(id: number, updateDto: UpdateUbicacionDto) {
    const ubicacion = await this.findOne(id);
    Object.assign(ubicacion, updateDto);
    return this.ubicacionRepository.save(ubicacion);
  }

  async remove(id: number) {
    const ubicacion = await this.findOne(id);
    await this.ubicacionRepository.remove(ubicacion);
    return { success: true };
  }

  async asignarProducto(dto: AsignarProductoUbicacionDto) {
    // Verificar que el producto existe
    const producto = await this.productoRepository.findOne({
      where: { id: dto.producto_id },
    });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${dto.producto_id} no encontrado`);
    }

    // Verificar que la ubicación existe
    const ubicacion = await this.ubicacionRepository.findOne({
      where: { id: dto.ubicacion_id },
    });
    if (!ubicacion) {
      throw new NotFoundException(`Ubicación con ID ${dto.ubicacion_id} no encontrada`);
    }

    // Buscar si ya existe la relación
    let productoUbicacion = await this.productoUbicacionRepository.findOne({
      where: {
        producto_id: dto.producto_id,
        ubicacion_id: dto.ubicacion_id,
      },
    });

    if (productoUbicacion) {
      // Actualizar stock existente
      productoUbicacion.stock = dto.stock;
      if (dto.stock_minimo !== undefined) productoUbicacion.stock_minimo = dto.stock_minimo;
      if (dto.stock_maximo !== undefined) productoUbicacion.stock_maximo = dto.stock_maximo;
      if (dto.estado_stock !== undefined) productoUbicacion.estado_stock = dto.estado_stock;
      if (dto.observaciones !== undefined) productoUbicacion.observaciones = dto.observaciones;
    } else {
      // Crear nueva relación
      productoUbicacion = this.productoUbicacionRepository.create({
        producto_id: dto.producto_id,
        ubicacion_id: dto.ubicacion_id,
        stock: dto.stock,
        stock_minimo: dto.stock_minimo,
        stock_maximo: dto.stock_maximo,
        estado_stock: dto.estado_stock || 'DISPONIBLE',
        observaciones: dto.observaciones,
      });
    }

    return this.productoUbicacionRepository.save(productoUbicacion);
  }

  async obtenerStockPorUbicacion(productoId: number) {
    const stocks = await this.productoUbicacionRepository.find({
      where: { producto_id: productoId },
      relations: ['ubicacion'],
    });

    return stocks.map((pu) => ({
      ubicacion_id: pu.ubicacion_id,
      ubicacion_nombre: pu.ubicacion.nombre,
      ubicacion_codigo: pu.ubicacion.codigo,
      ubicacion_tipo: pu.ubicacion.tipo,
      stock: pu.stock,
      stock_minimo: pu.stock_minimo,
      stock_maximo: pu.stock_maximo,
      estado_stock: pu.estado_stock,
    }));
  }

  async obtenerProductosPorUbicacion(ubicacionId: number) {
    const productosUbicacion = await this.productoUbicacionRepository.find({
      where: { ubicacion_id: ubicacionId },
      relations: ['producto', 'ubicacion'],
    });

    return productosUbicacion.map((pu) => ({
      id: pu.producto.id,
      codigo: pu.producto.codigo,
      sku: pu.producto.sku,
      nombre: pu.producto.nombre,
      precio: pu.producto.precio,
      stock: pu.stock,
      stock_minimo: pu.stock_minimo,
      stock_maximo: pu.stock_maximo,
      estado_stock: pu.estado_stock,
      ubicacion_nombre: pu.ubicacion.nombre,
      ubicacion_codigo: pu.ubicacion.codigo,
    }));
  }
}

