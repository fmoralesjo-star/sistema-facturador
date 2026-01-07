import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ContingenciaService } from './contingencia.service';
import { EmailService } from './email.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly contingenciaService: ContingenciaService,
    private readonly emailService: EmailService,
  ) { }

  @Get('estadisticas')
  getEstadisticas() {
    return this.adminService.getEstadisticas();
  }

  @Get('actividad')
  getActividad() {
    return this.adminService.getActividad();
  }

  @Get('configuracion')
  getConfiguracion() {
    return this.adminService.getConfiguracion();
  }

  @Put('configuracion')
  updateConfiguracion(@Body() configuracion: any) {
    return this.adminService.updateConfiguracion(configuracion);
  }

  @Get('validate-config')
  validateConfiguration() {
    return this.adminService.validateConfiguration();
  }

  @Get('backups')
  async getBackups() {
    try {
      return await this.adminService.getBackups();
    } catch (e) {
      console.error('Controller Crash (getBackups):', e);
      return { success: false, message: 'CRASH: ' + e.message };
    }
  }

  @Post('backup')
  async createBackup() {
    try {
      return await this.adminService.createBackup();
    } catch (e) {
      console.error('Controller Crash (createBackup):', e);
      return { success: false, message: 'CRASH: ' + e.message };
    }
  }

  @Post('restaurar')
  restaurarBackup(@Body() body: { archivo: string }) {
    return this.adminService.restaurarBackup(body.archivo);
  }

  @Post('limpiar')
  limpiarDatos(@Body() body: { tipo: string; dias: number }) {
    return this.adminService.limpiarDatos(body.tipo, body.dias);
  }

  @Get('reportes')
  getReportes(
    @Query('tipo') tipo: string,
    @Query('fecha_inicio') fechaInicio: string,
    @Query('fecha_fin') fechaFin: string,
  ) {
    return this.adminService.getReportes(tipo, fechaInicio, fechaFin);
  }

  @Get('health')
  getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get('resources')
  async getSystemResources() {
    try {
      return await this.adminService.getSystemResources();
    } catch (e) {
      console.error('Controller Crash (getSystemResources):', e);
      return { success: false, message: 'CRASH: ' + e.message };
    }
  }

  @Post('clear-memory')
  async clearMemory() {
    try {
      return await this.adminService.clearMemory();
    } catch (e) {
      console.error('Controller Crash (clearMemory):', e);
      return { success: false, message: 'CRASH: ' + e.message };
    }
  }

  @Get('sri-status')
  async getSRIStatus() {
    try {
      return await this.adminService.checkSRIStatus();
    } catch (e) {
      console.error('Controller Crash (getSRIStatus):', e);
      return { overall: 'offline', error: e.message };
    }
  }

  // ==================== CONTINGENCIA ENDPOINTS ====================

  @Get('documentos-pendientes')
  async getDocumentosPendientes(@Query('tipo') tipo?: string, @Query('estado') estado?: string) {
    try {
      return await this.contingenciaService.obtenerDocumentosPendientes({ tipo, estado });
    } catch (e) {
      console.error('Error obteniendo documentos pendientes:', e);
      return { error: e.message };
    }
  }

  @Get('contador-documentos-represados')
  async getContadorDocumentosRepresados() {
    try {
      return await this.contingenciaService.obtenerContadorDocumentosRepresados();
    } catch (e) {
      console.error('Error obteniendo contador:', e);
      return { total: 0, facturas: 0, notasCredito: 0, anulaciones: 0, retenciones: 0 };
    }
  }

  @Post('reintentar-envio/:id')
  async reintentarEnvio(@Query('id') id: string) {
    try {
      return await this.contingenciaService.reintentarEnvioDocumento(parseInt(id, 10));
    } catch (e) {
      console.error('Error reintentando envío:', e);
      return { exito: false, mensaje: e.message };
    }
  }

  @Post('procesar-cola-contingencia')
  async procesarColaContingencia() {
    try {
      return await this.contingenciaService.procesarColaContingencia();
    } catch (e) {
      console.error('Error procesando cola:', e);
      return { procesados: 0, exitosos: 0, fallidos: 0, errores: [e.message] };
    }
  }
  @Post('test-smtp')
  async testSmtpConnection(@Body() config: any) {
    try {
      return await this.adminService.testSmtpConnection(config);
    } catch (e) {
      console.error('Test SMTP Error:', e);
      return { success: false, message: e.message };
    }
  }
  @Get('emails')
  async getEmails(@Query('limit') limit: number) {
    return this.emailService.obtenerLogs(limit || 50);
  }

  @Post('emails/:id/retry')
  async retryEmail(@Query('id') id: string) {
    return this.emailService.reintentar(parseInt(id, 10));
  }
}



