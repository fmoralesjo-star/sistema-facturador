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
import { RecursosHumanosService } from './recursos-humanos.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';

@Controller('recursos-humanos')
export class RecursosHumanosController {
  constructor(private readonly rhService: RecursosHumanosService) { }

  @Get('empleados')
  findAllEmpleados() {
    return this.rhService.findAllEmpleados();
  }

  @Post('empleados')
  @HttpCode(HttpStatus.CREATED)
  createEmpleado(@Body() createDto: CreateEmpleadoDto) {
    return this.rhService.createEmpleado(createDto);
  }

  @Put('empleados/:id')
  updateEmpleado(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: CreateEmpleadoDto,
  ) {
    return this.rhService.updateEmpleado(id, updateDto);
  }

  @Delete('empleados/:id')
  @HttpCode(HttpStatus.OK)
  removeEmpleado(@Param('id', ParseIntPipe) id: number) {
    return this.rhService.removeEmpleado(id);
  }

  @Get('asistencias')
  findAllAsistencias() {
    return this.rhService.findAllAsistencias();
  }

  @Post('asistencias')
  @HttpCode(HttpStatus.CREATED)
  createAsistencia(@Body() createDto: CreateAsistenciaDto) {
    return this.rhService.createAsistencia(createDto);
  }

  @Post('generar-rol')
  generarRol(@Body('periodo') periodo: string) {
    return this.rhService.generarRolPagos(periodo || new Date().toISOString().slice(0, 7));
  }
}












