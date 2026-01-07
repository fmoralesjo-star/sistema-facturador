import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { CreateClienteDto, UpdateClienteDto } from './clientes.service';

const useFirestore = process.env.USE_FIRESTORE === 'true';

@Controller('clientes')
export class ClientesController {
  constructor(
    @Inject('ClientesService')
    private readonly clientesService: any,
  ) { }

  @Get()
  findAll() {
    return this.clientesService.findAll();
  }

  @Get('consultar-ruc/:ruc')
  findByRuc(@Param('ruc') ruc: string) {
    return this.clientesService.findByRuc(ruc);
  }

  @Get(':id')
  findOne(@Param('id') id: string | number) {
    const idStr = useFirestore ? String(id) : Number(id);
    return this.clientesService.findOne(idStr);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateClienteDto) {
    return this.clientesService.create(createDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string | number,
    @Body() updateDto: UpdateClienteDto,
  ) {
    const idStr = useFirestore ? String(id) : Number(id);
    return this.clientesService.update(idStr, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string | number) {
    const idStr = useFirestore ? String(id) : Number(id);
    return this.clientesService.remove(idStr);
  }

  // =============================================
  // ENDPOINTS DE HISTORIAL DE COMPRAS
  // =============================================

  /**
   * GET /clientes/:id/historial
   * Obtiene el historial de facturas de un cliente
   */
  @Get(':id/historial')
  getHistorialCompras(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.getHistorialCompras(id);
  }

  /**
   * GET /clientes/:id/productos-frecuentes
   * Obtiene los productos más comprados por un cliente
   */
  @Get(':id/productos-frecuentes')
  getProductosFrecuentes(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.getProductosFrecuentes(id);
  }

  /**
   * GET /clientes/:id/estadisticas
   * Obtiene estadísticas de compras de un cliente
   */
  @Get(':id/estadisticas')
  getEstadisticas(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.getEstadisticas(id);
  }

  /**
   * POST /clientes/:id/actualizar-totales
   * Recalcula los totales acumulados del cliente
   */
  @Post(':id/actualizar-totales')
  actualizarTotales(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.actualizarTotalesCliente(id);
  }
}

