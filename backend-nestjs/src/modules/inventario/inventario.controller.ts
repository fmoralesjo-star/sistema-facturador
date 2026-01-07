import { Controller, Get, Post, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { InventarioService, CreateMovimientoDto } from './inventario.service';

@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) { }

  @Get()
  async getInventario() {
    return this.inventarioService.obtenerInventario();
  }

  @Get('movimientos')
  async getMovimientos() {
    return this.inventarioService.obtenerMovimientos();
  }

  @Get('estadisticas')
  async getEstadisticas() {
    return this.inventarioService.obtenerEstadisticas();
  }

  @Get('stock-bajo')
  async getStockBajo(@Query('limite') limite?: string) {
    const limiteNum = limite ? parseInt(limite, 10) : 10;
    return this.inventarioService.obtenerStockBajo(limiteNum);
  }

  @Get('kardex/:producto_id')
  async getKardex(
    @Param('producto_id', ParseIntPipe) productoId: number,
    @Query('punto_venta_id') puntoVentaId?: string
  ) {
    const puntoVentaIdNum = puntoVentaId ? parseInt(puntoVentaId) : undefined;
    return this.inventarioService.obtenerKardex(productoId, puntoVentaIdNum);
  }

  @Get('alertas')
  async getAlertas() {
    return this.inventarioService.obtenerAlertas();
  }

  @Get('alertas/resumen')
  async getResumenAlertas() {
    return this.inventarioService.obtenerResumenAlertas();
  }

  @Get('productos-reorden')
  async getProductosReorden() {
    return this.inventarioService.obtenerProductosReorden();
  }

  @Get('valoracion')
  async getValoracion() {
    return this.inventarioService.obtenerValoracionTotalInventario();
  }

  @Post('movimientos')
  async createMovimiento(@Body() dto: any) {
    // Convertir tipo a mayúsculas para compatibilidad
    const tipoNormalizado = (dto.tipo?.toUpperCase() || 'ENTRADA') as 'ENTRADA' | 'SALIDA' | 'AJUSTE';
    const movimientoDto: CreateMovimientoDto = {
      producto_id: dto.producto_id,
      tipo: tipoNormalizado,
      cantidad: dto.cantidad,
      motivo: dto.motivo,
      observaciones: dto.motivo,
      fecha: dto.fecha ? new Date(dto.fecha) : new Date(),
      punto_venta_id: dto.punto_venta_id,
    };

    // Si hay punto_venta_id, actualizar stock del punto de venta
    if (dto.punto_venta_id) {
      await this.inventarioService.actualizarStockPuntoVenta(
        dto.producto_id,
        dto.punto_venta_id,
        dto.cantidad,
        tipoNormalizado,
      );
    }

    return this.inventarioService.registrarMovimientoConActualizacion(movimientoDto);
  }

  @Get('punto-venta/:puntoVentaId')
  async getInventarioPorPuntoVenta(@Param('puntoVentaId', ParseIntPipe) puntoVentaId: number) {
    return this.inventarioService.obtenerInventarioPorPuntoVenta(puntoVentaId);
  }

  @Post('transferencia')
  async transferirStock(@Body() dto: { producto_id: number; punto_venta_origen: number; punto_venta_destino: number; cantidad: number }) {
    return this.inventarioService.transferirStock(
      dto.producto_id,
      dto.punto_venta_origen,
      dto.punto_venta_destino,
      dto.cantidad,
    );
  }

  @Post('ajuste-masivo')
  async ajusteMasivo(@Body() dto: { ajustes: any[]; punto_venta_id: number; fecha?: string; motivo?: string }) {
    const resultados = [];
    const fecha = dto.fecha ? new Date(dto.fecha) : new Date();

    for (const ajuste of dto.ajustes) {
      try {
        // ajuste = { producto_id, cantidad_fisica, stock_sistema }
        // Calcular diferencia: Físico - Sistema
        // Si Físico (10) > Sistema (8) = +2 (Entrada/Ajuste Positivo) -> Sobrante
        // Si Físico (5) < Sistema (8) = -3 (Salida/Ajuste Negativo) -> Faltante

        const diferencia = ajuste.cantidad_fisica - ajuste.stock_sistema;

        if (diferencia !== 0) {
          // Normalizar tipo
          const tipo = diferencia > 0 ? 'ENTRADA' : 'SALIDA';
          const cantidad = Math.abs(diferencia);

          // Registrar movimiento
          const movimientoDto: CreateMovimientoDto = {
            producto_id: ajuste.producto_id,
            tipo: 'AJUSTE', // Usamos AJUSTE para marcarlo específicamente
            cantidad: cantidad,
            motivo: dto.motivo || `Toma Física: ${diferencia > 0 ? 'Sobrante' : 'Faltante'} detectado`,
            observaciones: `Stock Sistema: ${ajuste.stock_sistema} | Conteo Físico: ${ajuste.cantidad_fisica}`,
            fecha: fecha,
            punto_venta_id: dto.punto_venta_id
          };

          // Actualizar stock
          if (dto.punto_venta_id) {
            await this.inventarioService.actualizarStockPuntoVenta(
              ajuste.producto_id,
              dto.punto_venta_id,
              ajuste.cantidad_fisica, // En ajuste, seteamos el valor directo
              'AJUSTE'
            );
          }

          // Registrar el movimiento histórico
          await this.inventarioService.registrarMovimientoConActualizacion(movimientoDto);

          resultados.push({
            producto_id: ajuste.producto_id,
            estado: 'OK',
            diferencia: diferencia
          });
        }
      } catch (error) {
        console.error(`Error ajustando producto ${ajuste.producto_id}:`, error);
        resultados.push({
          producto_id: ajuste.producto_id,
          estado: 'ERROR',
          error: error.message
        });
      }
    }

    return { procesados: resultados.length, detalles: resultados };
  }

  @Post('transferencia-masiva')
  async transferenciaMasiva(@Body() dto: {
    transferencias: Array<{ producto_id: number; cantidad: number }>;
    punto_venta_origen: number;
    punto_venta_destino: number;
    motivo?: string;
    fecha?: string;
  }) {
    const resultados = [];
    const fecha = dto.fecha ? new Date(dto.fecha) : new Date();

    for (const transfer of dto.transferencias) {
      try {
        // Transferir stock entre puntos de venta
        await this.inventarioService.transferirStock(
          transfer.producto_id,
          dto.punto_venta_origen,
          dto.punto_venta_destino,
          transfer.cantidad
        );

        resultados.push({
          producto_id: transfer.producto_id,
          estado: 'OK',
          cantidad: transfer.cantidad
        });
      } catch (error) {
        console.error(`Error transfiriendo producto ${transfer.producto_id}:`, error);
        resultados.push({
          producto_id: transfer.producto_id,
          estado: 'ERROR',
          error: error.message
        });
      }
    }

    return {
      procesados: resultados.filter(r => r.estado === 'OK').length,
      fallidos: resultados.filter(r => r.estado === 'ERROR').length,
      detalles: resultados
    };
  }
}



