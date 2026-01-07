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
import { PromocionesService } from './promociones.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';

@Controller('promociones')
export class PromocionesController {
  constructor(private readonly promocionesService: PromocionesService) {}

  @Get()
  findAll() {
    return this.promocionesService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreatePromocionDto) {
    return this.promocionesService.create(createDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.promocionesService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Partial<CreatePromocionDto>,
  ) {
    return this.promocionesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.promocionesService.remove(id);
  }

  @Get('activas/producto/:productoId')
  getPromocionesActivasPorProducto(@Param('productoId', ParseIntPipe) productoId: number) {
    return this.promocionesService.findActivasPorProducto(productoId);
  }
}

