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
  UsuariosService,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  PermisoDto,
} from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get('roles')
  findAllRoles() {
    return this.usuariosService.findAllRoles();
  }

  @Get('roles/:id')
  findOneRol(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOneRol(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Get(':id/permisos')
  getPermisos(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.getPermisos(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateUsuarioDto) {
    return this.usuariosService.create(createDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, updateDto);
  }

  @Put(':id/permisos')
  updatePermisos(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { permisos: PermisoDto[] },
  ) {
    return this.usuariosService.updatePermisos(id, body.permisos);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }
}
