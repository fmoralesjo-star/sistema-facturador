import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PlanCuentasService, CreateCuentaDto, UpdateCuentaDto } from '../services/plan-cuentas.service';

@Controller('plan-cuentas')
export class PlanCuentasController {
  constructor(private readonly planCuentasService: PlanCuentasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateCuentaDto) {
    return this.planCuentasService.create(createDto);
  }

  @Get()
  findAll() {
    return this.planCuentasService.findAll();
  }

  @Get('movimiento')
  findCuentasMovimiento() {
    return this.planCuentasService.findCuentasMovimiento();
  }

  @Get('inicializar')
  @HttpCode(HttpStatus.OK)
  async inicializar() {
    await this.planCuentasService.inicializarPlanBasico();
    return { message: 'Plan de cuentas inicializado correctamente' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planCuentasService.findOne(+id);
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.planCuentasService.findByCodigo(codigo);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateCuentaDto) {
    return this.planCuentasService.update(+id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.planCuentasService.remove(+id);
  }
}


















