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

  @Post('sync-firebase')
  @HttpCode(HttpStatus.OK)
  syncFirebaseUser(@Body() body: {
    firebase_uid: string;
    email: string;
    nombre_completo: string;
    identificacion?: string;
    telefono?: string;
    direccion?: string;
    fecha_nacimiento?: string;
    sueldo?: number;
    foto_cedula_anverso?: string;
    foto_cedula_reverso?: string;
  }) {
    return this.usuariosService.syncFirebaseUser(
      body.firebase_uid,
      body.email,
      body.nombre_completo,
      {
        identificacion: body.identificacion,
        telefono: body.telefono,
        direccion: body.direccion,
        fecha_nacimiento: body.fecha_nacimiento,
        sueldo: body.sueldo,
        foto_cedula_anverso: body.foto_cedula_anverso,
        foto_cedula_reverso: body.foto_cedula_reverso
      }
    );
  }
}
