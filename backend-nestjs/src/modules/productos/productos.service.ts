import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { EventsGateway } from '../../gateways/events.gateway';

export class CreateProductoDto {
  num_movimiento?: string;
  fecha_movimiento?: Date | string;
  codigo: string;
  grupo_comercial?: string;
  referencia?: string;
  sku?: string; // Stock Keeping Unit
  nombre: string;
  descripcion?: string;
  coleccion?: string;
  categoria?: string;
  talla?: string;
  color?: string;
  desc_color?: string;
  cod_barras?: string;
  precio_costo?: number;
  precio: number; // Precio público
  unidad?: string;
  stock?: number;
  punto_reorden?: number;
  stock_seguridad?: number;
  tiempo_entrega_dias?: number;
}

export class UpdateProductoDto {
  num_movimiento?: string;
  fecha_movimiento?: Date | string;
  codigo?: string;
  grupo_comercial?: string;
  referencia?: string;
  sku?: string; // Stock Keeping Unit
  nombre?: string;
  descripcion?: string;
  coleccion?: string;
  categoria?: string;
  talla?: string;
  color?: string;
  desc_color?: string;
  cod_barras?: string;
  precio_costo?: number;
  precio?: number; // Precio público
  unidad?: string;
  stock?: number;
  punto_reorden?: number;
  stock_seguridad?: number;
  tiempo_entrega_dias?: number;
}

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway,
  ) { }

  async findAll() {
    return this.productoRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async findByCodigoOrBarrasOrSku(codigo?: string, codBarras?: string, sku?: string) {
    const queryBuilder = this.productoRepository.createQueryBuilder('producto');

    const condiciones = [];
    const parametros: any = {};

    if (codigo) {
      condiciones.push('producto.codigo = :codigo');
      parametros.codigo = codigo;
    }

    if (codBarras) {
      condiciones.push('producto.cod_barras = :codBarras');
      parametros.codBarras = codBarras;
    }

    if (sku) {
      condiciones.push('producto.sku = :sku');
      parametros.sku = sku;
    }

    if (condiciones.length > 0) {
      queryBuilder.where(`(${condiciones.join(' OR ')})`, parametros);
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number) {
    const producto = await this.productoRepository.findOne({ where: { id } });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return producto;
  }

  async create(createDto: CreateProductoDto) {
    const producto = this.productoRepository.create({
      ...createDto,
      stock: createDto.stock || 0,
      fecha_movimiento: createDto.fecha_movimiento
        ? (typeof createDto.fecha_movimiento === 'string'
          ? new Date(createDto.fecha_movimiento)
          : createDto.fecha_movimiento)
        : new Date(),
    });
    const saved = await this.productoRepository.save(producto);
    this.eventsGateway.emitProductoCreado(saved);
    return saved;
  }

  async update(id: number, updateDto: UpdateProductoDto) {
    const producto = await this.findOne(id);
    Object.assign(producto, updateDto);
    const saved = await this.productoRepository.save(producto);
    this.eventsGateway.emitProductoActualizado(saved);
    return saved;
  }

  async remove(id: number) {
    const producto = await this.findOne(id);
    // Realizar eliminación lógica (soft delete)
    await this.productoRepository.softRemove(producto);
    this.eventsGateway.emitProductoEliminado(id);
    return { success: true };
  }

  async crearProductoEjemplo() {
    try {
      // Verificar si ya existe
      const existe = await this.productoRepository.findOne({
        where: [{ codigo: 'PRENDA-001' }, { sku: 'PRENDA-XS-001' }],
      });

      if (existe) {
        return {
          success: false,
          message: 'El producto de ejemplo ya existe (Código: PRENDA-001 o SKU: PRENDA-XS-001)',
          producto: existe,
        };
      }

      // Crear producto de ejemplo
      const producto = this.productoRepository.create({
        codigo: 'PRENDA-001',
        sku: 'PRENDA-XS-001',
        nombre: 'Camiseta Básica - Talla XS',
        descripcion: 'Camiseta de algodón 100%, color blanco, talla XS. Ideal para uso diario. Material suave y cómodo.',
        precio: 25.99,
        stock: 45,
        tipo_impuesto: '15', // IVA 15% (valor por defecto en la entidad)
        activo: true,
        punto_reorden: 30,
        stock_seguridad: 15,
        tiempo_entrega_dias: 7,
        costo_promedio: 15.50,
      });

      const productoGuardado = await this.productoRepository.save(producto);
      this.eventsGateway.emitProductoCreado(productoGuardado);

      return {
        success: true,
        message: 'Producto de ejemplo creado exitosamente',
        producto: productoGuardado,
      };
    } catch (error) {
      console.error('Error al crear producto de ejemplo:', error);
      throw error;
    }
  }

  async crearProductosMasivos(productosDto: CreateProductoDto[]) {
    const resultados = {
      exitosos: [],
      fallidos: [],
      total: productosDto.length,
    };

    for (const productoDto of productosDto) {
      try {
        // Verificar si ya existe por código o SKU
        const existe = await this.productoRepository.findOne({
          where: [
            { codigo: productoDto.codigo },
            ...(productoDto.sku ? [{ sku: productoDto.sku }] : []),
          ],
        });

        if (existe) {
          resultados.fallidos.push({
            producto: productoDto,
            error: `Ya existe un producto con código "${productoDto.codigo}"${productoDto.sku ? ` o SKU "${productoDto.sku}"` : ''}`,
          });
          continue;
        }

        // Crear producto
        const producto = this.productoRepository.create({
          ...productoDto,
          stock: productoDto.stock || 0,
          tipo_impuesto: '15',
          activo: true,
        });

        const productoGuardado = await this.productoRepository.save(producto);
        this.eventsGateway.emitProductoCreado(productoGuardado);

        resultados.exitosos.push(productoGuardado);
      } catch (error) {
        resultados.fallidos.push({
          producto: productoDto,
          error: error.message || 'Error desconocido al crear el producto',
        });
      }
    }

    return resultados;
  }
}

