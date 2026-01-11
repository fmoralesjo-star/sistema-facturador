import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';
import { Cliente } from './entities/cliente.entity';
import { EventsGateway } from '../../gateways/events.gateway';

export class CreateClienteDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  ruc?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsBoolean()
  @IsOptional()
  @IsBoolean()
  esExtranjero?: boolean;

  // === CAMPOS EXTENDIDOS ===

  // Identificación
  @IsOptional() @IsString() tipo_persona?: string;
  @IsOptional() @IsString() razon_social?: string;
  @IsOptional() @IsString() nombre_comercial?: string;
  @IsOptional() @IsString() contribuyente_especial?: string;

  // Relaciones
  @IsOptional() @IsString() persona_relacionada?: string;
  @IsOptional() @IsString() categoria_persona?: string;
  @IsOptional() @IsString() vendedor_asignado?: string;

  // Roles
  @IsOptional() @IsBoolean() es_cliente?: boolean;
  @IsOptional() @IsBoolean() es_proveedor?: boolean;
  @IsOptional() @IsBoolean() es_vendedor?: boolean;
  @IsOptional() @IsBoolean() es_empleado?: boolean;
  @IsOptional() @IsBoolean() es_artesano?: boolean;
  @IsOptional() @IsBoolean() para_exportacion?: boolean;

  // Contabilidad
  @IsOptional() @IsString() centro_costo_cliente?: string;
  @IsOptional() @IsString() cuenta_por_cobrar?: string;
  @IsOptional() @IsString() centro_costo_proveedor?: string;
  @IsOptional() @IsString() cuenta_por_pagar?: string;

  // Comercial
  @IsOptional() descuento_porcentaje?: number;
  @IsOptional() dias_credito?: number;
  @IsOptional() @IsString() pvp_por_defecto?: string;
  // monto_credito ya existe en entidad como limite_credito, si se quiere mapear:
  @IsOptional() limite_credito?: number;

  // Bancario
  @IsOptional() @IsString() banco_nombre?: string;
  @IsOptional() @IsString() cuenta_bancaria_numero?: string;
  @IsOptional() @IsString() cuenta_bancaria_tipo?: string;

  // RRHH
  @IsOptional() @IsString() departamento?: string;
  @IsOptional() @IsString() cargo?: string;
  @IsOptional() @IsString() grupo_empleado?: string;
  @IsOptional() sueldo?: number;
  @IsOptional() @IsString() tiempo_trabajo?: string;
  @IsOptional() @IsString() fecha_ultimo_ingreso?: string;
  @IsOptional() @IsString() fecha_ultima_salida?: string;
  @IsOptional() numero_cargas?: number;
  @IsOptional() vacaciones_tomadas?: number;
  @IsOptional() @IsString() centro_costo_rrhh?: string;
  @IsOptional() @IsString() tipo_contrato?: string;
  @IsOptional() @IsString() notas?: string;
}

export class UpdateClienteDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  ruc?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsBoolean()
  esExtranjero?: boolean;

  // === CAMPOS EXTENDIDOS (Mismos que Create) ===
  @IsOptional() @IsString() tipo_persona?: string;
  @IsOptional() @IsString() razon_social?: string;
  @IsOptional() @IsString() nombre_comercial?: string;
  @IsOptional() @IsString() contribuyente_especial?: string;
  @IsOptional() @IsString() persona_relacionada?: string;
  @IsOptional() @IsString() categoria_persona?: string;
  @IsOptional() @IsString() vendedor_asignado?: string;

  @IsOptional() @IsBoolean() es_cliente?: boolean;
  @IsOptional() @IsBoolean() es_proveedor?: boolean;
  @IsOptional() @IsBoolean() es_vendedor?: boolean;
  @IsOptional() @IsBoolean() es_empleado?: boolean;
  @IsOptional() @IsBoolean() es_artesano?: boolean;
  @IsOptional() @IsBoolean() para_exportacion?: boolean;

  @IsOptional() @IsString() centro_costo_cliente?: string;
  @IsOptional() @IsString() cuenta_por_cobrar?: string;
  @IsOptional() @IsString() centro_costo_proveedor?: string;
  @IsOptional() @IsString() cuenta_por_pagar?: string;

  @IsOptional() descuento_porcentaje?: number;
  @IsOptional() dias_credito?: number;
  @IsOptional() @IsString() pvp_por_defecto?: string;
  @IsOptional() limite_credito?: number;

  @IsOptional() @IsString() banco_nombre?: string;
  @IsOptional() @IsString() cuenta_bancaria_numero?: string;
  @IsOptional() @IsString() cuenta_bancaria_tipo?: string;

  @IsOptional() @IsString() departamento?: string;
  @IsOptional() @IsString() cargo?: string;
  @IsOptional() @IsString() grupo_empleado?: string;
  @IsOptional() sueldo?: number;
  @IsOptional() @IsString() tiempo_trabajo?: string;
  @IsOptional() @IsString() fecha_ultimo_ingreso?: string;
  @IsOptional() @IsString() fecha_ultima_salida?: string;
  @IsOptional() numero_cargas?: number;
  @IsOptional() vacaciones_tomadas?: number;
  @IsOptional() @IsString() centro_costo_rrhh?: string;
  @IsOptional() @IsString() tipo_contrato?: string;
  @IsOptional() @IsString() notas?: string;
}

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway,
  ) { }

  async findAll() {
    return this.clienteRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number) {
    const cliente = await this.clienteRepository.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return cliente;
  }

  async findByRuc(ruc: string) {
    return this.clienteRepository.findOne({ where: { ruc } });
  }

  async create(createDto: CreateClienteDto) {
    const cliente = this.clienteRepository.create(createDto);
    const saved = await this.clienteRepository.save(cliente);
    this.eventsGateway.emitClienteCreado(saved);
    return saved;
  }

  async update(id: number, updateDto: UpdateClienteDto) {
    const cliente = await this.findOne(id);
    Object.assign(cliente, updateDto);
    const saved = await this.clienteRepository.save(cliente);
    this.eventsGateway.emitClienteActualizado(saved);
    return saved;
  }

  async remove(id: number) {
    const cliente = await this.findOne(id);
    await this.clienteRepository.remove(cliente);
    return { success: true };
  }

  // =============================================
  // HISTORIAL DE COMPRAS
  // =============================================

  /**
   * Obtiene el historial completo de facturas de un cliente
   */
  async getHistorialCompras(clienteId: number, limit = 50) {
    const cliente = await this.findOne(clienteId);

    const facturas = await this.clienteRepository.manager.query(`
      SELECT 
        f.id,
        f.numero,
        f.fecha,
        f.subtotal,
        f.impuesto,
        f.total,
        f.estado,
        f.forma_pago,
        f.clave_acceso,
        f.autorizacion
      FROM facturas f
      WHERE f.cliente_id = $1
      ORDER BY f.fecha DESC, f.id DESC
      LIMIT $2
    `, [clienteId, limit]);

    return {
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        ruc: cliente.ruc,
        email: cliente.email
      },
      facturas,
      total_facturas: facturas.length
    };
  }

  /**
   * Obtiene los productos más comprados por un cliente
   */
  async getProductosFrecuentes(clienteId: number, limit = 10) {
    await this.findOne(clienteId); // Verificar que existe

    const productos = await this.clienteRepository.manager.query(`
      SELECT 
        p.id,
        p.nombre,
        p.codigo,
        p.precio_venta,
        COUNT(fd.id) as veces_comprado,
        SUM(fd.cantidad) as cantidad_total,
        SUM(fd.subtotal) as total_gastado,
        MAX(f.fecha) as ultima_compra
      FROM factura_detalles fd
      INNER JOIN facturas f ON f.id = fd.factura_id
      INNER JOIN productos p ON p.id = fd.producto_id
      WHERE f.cliente_id = $1 AND f.estado != 'ANULADA'
      GROUP BY p.id, p.nombre, p.codigo, p.precio_venta
      ORDER BY cantidad_total DESC, veces_comprado DESC
      LIMIT $2
    `, [clienteId, limit]);

    return productos;
  }

  /**
   * Obtiene estadísticas de compras de un cliente
   */
  async getEstadisticas(clienteId: number) {
    const cliente = await this.findOne(clienteId);

    // Estadísticas generales
    const stats = await this.clienteRepository.manager.query(`
      SELECT 
        COUNT(f.id) as total_facturas,
        COALESCE(SUM(f.total), 0) as total_gastado,
        COALESCE(AVG(f.total), 0) as promedio_compra,
        COALESCE(MIN(f.total), 0) as compra_minima,
        COALESCE(MAX(f.total), 0) as compra_maxima,
        MIN(f.fecha) as primera_compra,
        MAX(f.fecha) as ultima_compra
      FROM facturas f
      WHERE f.cliente_id = $1 AND f.estado != 'ANULADA'
    `, [clienteId]);

    // Compras por mes (últimos 12 meses)
    const comprasPorMes = await this.clienteRepository.manager.query(`
      SELECT 
        TO_CHAR(f.fecha, 'YYYY-MM') as mes,
        COUNT(f.id) as cantidad_facturas,
        COALESCE(SUM(f.total), 0) as total
      FROM facturas f
      WHERE f.cliente_id = $1 
        AND f.estado != 'ANULADA'
        AND f.fecha >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY TO_CHAR(f.fecha, 'YYYY-MM')
      ORDER BY mes DESC
    `, [clienteId]);

    // Productos únicos comprados
    const productosUnicos = await this.clienteRepository.manager.query(`
      SELECT COUNT(DISTINCT fd.producto_id) as total
      FROM factura_detalles fd
      INNER JOIN facturas f ON f.id = fd.factura_id
      WHERE f.cliente_id = $1 AND f.estado != 'ANULADA'
    `, [clienteId]);

    return {
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        ruc: cliente.ruc,
        tipo_cliente: cliente.tipo_cliente,
        limite_credito: cliente.limite_credito
      },
      resumen: stats[0] || {},
      productos_unicos_comprados: parseInt(productosUnicos[0]?.total || '0'),
      compras_por_mes: comprasPorMes
    };
  }

  /**
   * Actualiza los totales acumulados del cliente (llamar después de cada factura)
   */
  async actualizarTotalesCliente(clienteId: number) {
    const stats = await this.clienteRepository.manager.query(`
      SELECT 
        COUNT(f.id) as cantidad,
        COALESCE(SUM(f.total), 0) as total,
        MAX(f.fecha) as ultima
      FROM facturas f
      WHERE f.cliente_id = $1 AND f.estado != 'ANULADA'
    `, [clienteId]);

    if (stats[0]) {
      await this.clienteRepository.update(clienteId, {
        cantidad_compras: parseInt(stats[0].cantidad) || 0,
        total_compras_historico: parseFloat(stats[0].total) || 0,
        ultima_compra: stats[0].ultima || null
      });
    }

    return stats[0];
  }
}
