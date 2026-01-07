import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';

@Controller('compras')
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) { }

  @Get()
  findAll() {
    return this.comprasService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateCompraDto) {
    return this.comprasService.create(createDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.comprasService.findOne(id);
  }
  @Post('importar-xml')
  @UseInterceptors(FileInterceptor('file'))
  importarXml(@UploadedFile() file: Express.Multer.File) {
    return this.comprasService.importarXml(file.buffer);
  }

  @Post(':id/estado')
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: string,
  ) {
    return this.comprasService.updateEstado(id, estado);
  }
}












