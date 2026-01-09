import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { AdministracionTIService } from './administracion-ti.service';
import { SolicitarRolContadorDto } from './dto/solicitar-rol-contador.dto';
import { Verificar2FADto } from './dto/verificar-2fa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';

@Controller('administracion-ti')
export class AdministracionTIController {
  constructor(
    private readonly administracionTIService: AdministracionTIService,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private readonly usuariosService: UsuariosService,
  ) { }

  /**
   * Obtiene el usuarioId desde la sesión o request
   * TODO: Implementar autenticación con JWT en lugar de Firebase
   */
  private async obtenerUsuarioId(req: any): Promise<number> {
    // Placeholder: Se debe implementar autenticación JWT
    // Por ahora, buscar por email en el request
    const userEmail = req.user?.email || req.body?.email;

    if (!userEmail) {
      throw new ForbiddenException('Usuario no autenticado. Por favor, inicia sesión nuevamente.');
    }

    // Buscar usuario por email
    const usuario = await this.usuarioRepository.findOne({
      where: { email: userEmail },
    });

    if (!usuario) {
      throw new ForbiddenException(
        'Usuario no encontrado en la base de datos. Por favor, contacta al administrador del sistema.'
      );
    }

    return usuario.id;
  }

  /**
   * Verifica si el usuario actual es Administrador de TI
   */
  @Get('verificar-admin-ti')
  async verificarAdminTI(@Request() req) {
    try {
      const usuarioId = await this.obtenerUsuarioId(req);
      const esAdminTI = await this.administracionTIService.esAdministradorTI(usuarioId);
      return {
        esAdminTI,
        usuarioId,
        mensaje: esAdminTI
          ? 'Acceso autorizado como Administrador de TI'
          : 'No tienes permisos de Administrador de TI'
      };
    } catch (error) {
      throw new ForbiddenException(
        error.message || 'Error al verificar permisos. Por favor, contacta al administrador.'
      );
    }
  }

  /**
   * Solicita asignar el rol de Contador (requiere 2FA del dueño)
   */
  @Post('solicitar-rol-contador')
  async solicitarRolContador(@Request() req, @Body() solicitud: SolicitarRolContadorDto) {
    const usuarioId = await this.obtenerUsuarioId(req);
    return this.administracionTIService.solicitarRolContador(usuarioId, solicitud);
  }

  /**
   * Verifica el código 2FA y aprueba la asignación del rol
   */
  @Post('verificar-2fa')
  async verificar2FA(@Request() req, @Body() verificarDto: Verificar2FADto) {
    const usuarioId = await this.obtenerUsuarioId(req);
    return this.administracionTIService.verificar2FA(usuarioId, verificarDto);
  }

  /**
   * Obtiene las autorizaciones pendientes para el dueño
   */
  @Get('autorizaciones-pendientes')
  async obtenerAutorizacionesPendientes(@Request() req) {
    const usuarioId = await this.obtenerUsuarioId(req);
    return this.administracionTIService.obtenerAutorizacionesPendientes(usuarioId);
  }

  /**
   * Obtiene el historial de autorizaciones del Admin TI
   */
  @Get('historial-autorizaciones')
  async obtenerHistorialAutorizaciones(@Request() req) {
    const usuarioId = await this.obtenerUsuarioId(req);
    return this.administracionTIService.obtenerHistorialAutorizaciones(usuarioId);
  }
}

