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
} from '@nestjs/common';
import {
  UbicacionesService,
  CreateUbicacionDto,
  UpdateUbicacionDto,
  AsignarProductoUbicacionDto,
} from './ubicaciones.service';

@Controller('ubicaciones')
export class UbicacionesController {
  constructor(private readonly ubicacionesService: UbicacionesService) {}

  @Get()
  findAll() {
    return this.ubicacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ubicacionesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateUbicacionDto) {
    return this.ubicacionesService.create(createDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUbicacionDto,
  ) {
    return this.ubicacionesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ubicacionesService.remove(id);
  }

  @Post('asignar-producto')
  @HttpCode(HttpStatus.CREATED)
  asignarProducto(@Body() dto: AsignarProductoUbicacionDto) {
    return this.ubicacionesService.asignarProducto(dto);
  }

  @Get('producto/:productoId/stock')
  obtenerStockPorUbicacion(@Param('productoId', ParseIntPipe) productoId: number) {
    return this.ubicacionesService.obtenerStockPorUbicacion(productoId);
  }

  @Get(':ubicacionId/productos')
  obtenerProductosPorUbicacion(@Param('ubicacionId', ParseIntPipe) ubicacionId: number) {
    return this.ubicacionesService.obtenerProductosPorUbicacion(ubicacionId);
  }
}
















