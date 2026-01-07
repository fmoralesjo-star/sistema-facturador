import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Rol } from '../usuarios/entities/rol.entity';
import { Autorizacion2FA } from './entities/autorizacion-2fa.entity';
import { SolicitarRolContadorDto } from './dto/solicitar-rol-contador.dto';
import { Verificar2FADto } from './dto/verificar-2fa.dto';
import * as crypto from 'crypto';
import { UsuariosService } from '../usuarios/usuarios.service';

const useFirestore = process.env.USE_FIRESTORE === 'true' || process.env.USE_FIRESTORE === 'True';

@Injectable()
export class AdministracionTIService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
    @InjectRepository(Autorizacion2FA)
    private autorizacion2FARepository: Repository<Autorizacion2FA>,
    @Inject(forwardRef(() => UsuariosService))
    private usuariosService: any,
  ) { }

  /**
   * Verifica si un usuario es Administrador de TI
   */
  async esAdministradorTI(usuarioId: number): Promise<boolean> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
      relations: ['rol'],
    });

    if (!usuario || !usuario.rol) {
      return false;
    }

    const nombreRol = usuario.rol.nombre.toLowerCase();
    return nombreRol === 'administrador de ti' || nombreRol === 'admin ti' || nombreRol === 'administrador ti';
  }

  /**
   * Verifica si un usuario es Dueño de la Empresa
   */
  async esDueñoEmpresa(usuarioId: number | string): Promise<boolean> {
    if (useFirestore) {
      // En modo Firestore, usar el servicio de usuarios
      const usuario = await this.usuariosService.findOne(String(usuarioId));
      if (!usuario || !usuario.rol_id) {
        return false;
      }
      const rol = await this.usuariosService.findOneRol(String(usuario.rol_id));
      if (!rol) {
        return false;
      }
      const nombreRol = rol.nombre.toLowerCase();
      return nombreRol === 'dueño' || nombreRol === 'propietario' || nombreRol === 'owner';
    } else {
      // En modo PostgreSQL, usar TypeORM
      const usuario = await this.usuarioRepository.findOne({
        where: { id: Number(usuarioId) },
        relations: ['rol'],
      });

      if (!usuario || !usuario.rol) {
        return false;
      }

      const nombreRol = usuario.rol.nombre.toLowerCase();
      return nombreRol === 'dueño' || nombreRol === 'propietario' || nombreRol === 'owner';
    }
  }

  /**
   * Obtiene el dueño de la empresa (primer usuario con rol dueño)
   */
  async obtenerDueñoEmpresa(): Promise<Usuario | null> {
    const rolDueño = await this.rolRepository.findOne({
      where: [
        { nombre: 'Dueño' },
        { nombre: 'Propietario' },
        { nombre: 'Owner' },
      ],
    });

    if (!rolDueño) {
      return null;
    }

    const dueño = await this.usuarioRepository.findOne({
      where: { rol_id: rolDueño.id, activo: 1 },
    });

    return dueño;
  }

  /**
   * Genera un código de verificación de 6 dígitos
   */
  private generarCodigoVerificacion(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Solicita asignar el rol de Contador a un usuario (requiere 2FA del dueño)
   */
  async solicitarRolContador(
    adminTIId: number,
    solicitud: SolicitarRolContadorDto,
  ): Promise<{ autorizacion_id: number; mensaje: string }> {
    // Verificar que el usuario que hace la solicitud es Admin TI
    const esAdminTI = await this.esAdministradorTI(adminTIId);
    if (!esAdminTI) {
      throw new ForbiddenException('Solo los Administradores de TI pueden solicitar esta autorización');
    }

    // Verificar que el rol solicitado es "Contador"
    const rolContador = await this.rolRepository.findOne({
      where: { id: solicitud.rol_contador_id },
    });

    if (!rolContador) {
      throw new NotFoundException('Rol no encontrado');
    }

    const nombreRol = rolContador.nombre.toLowerCase();
    if (nombreRol !== 'contador') {
      throw new BadRequestException('Solo se puede solicitar autorización para el rol de Contador');
    }

    // Verificar si el usuario al que se le asignará el rol es el mismo Admin TI
    const usuarioDestino = await this.usuarioRepository.findOne({
      where: { id: solicitud.usuario_id },
    });

    if (!usuarioDestino) {
      throw new NotFoundException('Usuario destino no encontrado');
    }

    // Si el Admin TI intenta asignarse el rol a sí mismo, requiere 2FA
    if (usuarioDestino.id === adminTIId) {
      // Obtener el dueño de la empresa
      const dueño = await this.obtenerDueñoEmpresa();
      if (!dueño) {
        throw new NotFoundException('No se encontró un dueño de la empresa para autorizar');
      }

      // Verificar si ya existe una autorización pendiente
      const autorizacionExistente = await this.autorizacion2FARepository.findOne({
        where: {
          usuario_solicitante_id: adminTIId,
          usuario_autorizador_id: dueño.id,
          rol_solicitado_id: solicitud.rol_contador_id,
          estado: 'pendiente',
        },
      });

      if (autorizacionExistente) {
        // Verificar si no ha expirado
        if (autorizacionExistente.fecha_expiracion &&
          new Date() < autorizacionExistente.fecha_expiracion) {
          throw new BadRequestException('Ya existe una solicitud pendiente de autorización');
        } else {
          // Marcar como expirada
          autorizacionExistente.estado = 'expirado';
          await this.autorizacion2FARepository.save(autorizacionExistente);
        }
      }

      // Generar código de verificación
      const codigo = this.generarCodigoVerificacion();

      // Crear autorización
      const autorizacion = this.autorizacion2FARepository.create({
        usuario_solicitante_id: adminTIId,
        usuario_autorizador_id: dueño.id,
        rol_solicitado_id: solicitud.rol_contador_id,
        codigo_verificacion: codigo,
        estado: 'pendiente',
        fecha_expiracion: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
      });

      const autorizacionGuardada = await this.autorizacion2FARepository.save(autorizacion);

      // TODO: Enviar código por email o SMS al dueño
      // Por ahora, retornamos el código en el mensaje (solo para desarrollo)
      // En producción, esto debe enviarse por email/SMS

      return {
        autorizacion_id: autorizacionGuardada.id,
        mensaje: `Se ha enviado un código de verificación al dueño de la empresa. Código: ${codigo} (solo para desarrollo)`,
      };
    } else {
      // Si el Admin TI asigna el rol a otro usuario, no requiere 2FA
      // Pero aún así verificamos que no sea el rol de Contador sin autorización
      throw new BadRequestException('Para asignar el rol de Contador a otro usuario, se requiere autorización del dueño');
    }
  }

  /**
   * Verifica el código 2FA y aprueba la asignación del rol
   */
  async verificar2FA(
    dueñoId: number,
    verificarDto: Verificar2FADto,
  ): Promise<{ success: boolean; mensaje: string }> {
    // Verificar que el usuario es el dueño
    const esDueño = await this.esDueñoEmpresa(dueñoId);
    if (!esDueño) {
      throw new ForbiddenException('Solo el dueño de la empresa puede verificar esta autorización');
    }

    // Buscar la autorización
    const autorizacion = await this.autorizacion2FARepository.findOne({
      where: { id: verificarDto.autorizacion_id },
      relations: ['usuario_solicitante', 'usuario_autorizador'],
    });

    if (!autorizacion) {
      throw new NotFoundException('Autorización no encontrada');
    }

    // Verificar que la autorización es para este dueño
    if (autorizacion.usuario_autorizador_id !== dueñoId) {
      throw new ForbiddenException('Esta autorización no le corresponde');
    }

    // Verificar estado
    if (autorizacion.estado !== 'pendiente') {
      throw new BadRequestException(`La autorización ya fue ${autorizacion.estado}`);
    }

    // Verificar expiración
    if (autorizacion.fecha_expiracion && new Date() > autorizacion.fecha_expiracion) {
      autorizacion.estado = 'expirado';
      await this.autorizacion2FARepository.save(autorizacion);
      throw new BadRequestException('El código de verificación ha expirado');
    }

    // Verificar código
    if (autorizacion.codigo_verificacion !== verificarDto.codigo_verificacion) {
      throw new BadRequestException('Código de verificación incorrecto');
    }

    // Aprobar autorización
    autorizacion.estado = 'aprobado';
    autorizacion.fecha_aprobacion = new Date();
    await this.autorizacion2FARepository.save(autorizacion);

    // Asignar el rol al usuario
    await this.usuariosService.update(autorizacion.usuario_solicitante_id, {
      rol_id: autorizacion.rol_solicitado_id,
    });

    return {
      success: true,
      mensaje: 'Rol asignado exitosamente',
    };
  }

  /**
   * Obtiene las autorizaciones pendientes para un dueño
   */
  async obtenerAutorizacionesPendientes(dueñoId: number) {
    return this.autorizacion2FARepository.find({
      where: {
        usuario_autorizador_id: dueñoId,
        estado: 'pendiente',
      },
      relations: ['usuario_solicitante', 'usuario_autorizador'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Obtiene el historial de autorizaciones de un Admin TI
   */
  async obtenerHistorialAutorizaciones(adminTIId: number) {
    return this.autorizacion2FARepository.find({
      where: {
        usuario_solicitante_id: adminTIId,
      },
      relations: ['usuario_autorizador', 'usuario_solicitante'],
      order: { created_at: 'DESC' },
    });
  }
}

