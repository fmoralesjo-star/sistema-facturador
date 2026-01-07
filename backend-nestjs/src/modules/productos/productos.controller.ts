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
  Query,
} from '@nestjs/common';
import { CreateProductoDto, UpdateProductoDto } from './productos.service';

const useFirestore = process.env.USE_FIRESTORE === 'true';

@Controller('productos')
export class ProductosController {
  constructor(
    @Inject('ProductosService')
    private readonly productosService: any,
  ) {}

  @Get()
  findAll(@Query('codigo') codigo?: string, @Query('cod_barras') codBarras?: string, @Query('sku') sku?: string) {
    if (codigo || codBarras || sku) {
      return this.productosService.findByCodigoOrBarrasOrSku(codigo, codBarras, sku);
    }
    return this.productosService.findAll();
  }

  @Post('ejemplo/prenda')
  @HttpCode(HttpStatus.CREATED)
  crearProductoEjemplo() {
    return this.productosService.crearProductoEjemplo();
  }

  @Post('masivo')
  @HttpCode(HttpStatus.CREATED)
  crearProductosMasivos(@Body() productosDto: CreateProductoDto[]) {
    return this.productosService.crearProductosMasivos(productosDto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateProductoDto) {
    return this.productosService.create(createDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string | number) {
    const idStr = useFirestore ? String(id) : Number(id);
    return this.productosService.findOne(idStr);
  }

  @Put(':id')
  update(
    @Param('id') id: string | number,
    @Body() updateDto: UpdateProductoDto,
  ) {
    const idStr = useFirestore ? String(id) : Number(id);
    return this.productosService.update(idStr, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string | number) {
    const idStr = useFirestore ? String(id) : Number(id);
    return this.productosService.remove(idStr);
  }
}

