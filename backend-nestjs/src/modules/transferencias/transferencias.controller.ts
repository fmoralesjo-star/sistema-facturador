import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TransferenciasService } from './transferencias.service';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';

@Controller('transferencias')
export class TransferenciasController {
  constructor(private readonly transferenciasService: TransferenciasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTransferenciaDto: CreateTransferenciaDto) {
    return this.transferenciasService.create(createTransferenciaDto);
  }

  @Get()
  findAll() {
    return this.transferenciasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transferenciasService.findOne(id);
  }
}












