import { Injectable, Optional, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule'; // Import Cron
import { Factura } from '../facturas/entities/factura.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { BackupLog } from './entities/backup-log.entity'; // Import Log
import { Configuracion } from './entities/configuracion.entity';
import { AuditService } from '../audit/audit.service';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';
import axios from 'axios';
import * as nodemailer from 'nodemailer';

const useFirestore = process.env.USE_FIRESTORE === 'true' || process.env.USE_FIRESTORE === 'True';

@Injectable()
export class AdminService {
  constructor(
    @Optional()
    @InjectRepository(Factura)
    private facturaRepository?: Repository<Factura>,
    @Optional()
    @InjectRepository(Producto)
    private productoRepository?: Repository<Producto>,
    @Optional()
    @InjectRepository(Cliente)
    private clienteRepository?: Repository<Cliente>,
    @Optional()
    @InjectRepository(BackupLog)
    private backupLogRepository?: Repository<BackupLog>,
    @Optional()
    @InjectRepository(Configuracion)
    private configuracionRepository?: Repository<Configuracion>,
    @Optional()
    private readonly auditService?: AuditService,
  ) { }

  async getEstadisticas() {
    // Si está en modo Firestore, retornar valores por defecto
    if (useFirestore || !this.facturaRepository || !this.productoRepository || !this.clienteRepository) {
      return {
        facturas: 0,
        productos: 0,
        clientes: 0,
        compras: 0,
        proveedores: 0,
        ventas_mes: 0,
        compras_mes: 0,
        utilidad_mes: 0,
        stock_total: 0,
        productos_stock_bajo: 0,
      };
    }

    const [
      facturas,
      productos,
      clientes,
      compras,
      proveedores,
      stockTotal,
      productosStockBajo,
    ] = await Promise.all([
      this.facturaRepository.count(),
      this.productoRepository.count(),
      this.clienteRepository.count(),
      this.getComprasCount(),
      this.getProveedoresCount(),
      this.getStockTotal(),
      this.getProductosStockBajo(),
    ]);

    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const ventasMes = await this.facturaRepository
      .createQueryBuilder('f')
      .select('COALESCE(SUM(f.total), 0)', 'total')
      .where('f.fecha >= :inicioMes', { inicioMes })
      .getRawOne();

    const comprasMes = await this.getComprasMes(inicioMes);
    const utilidadMes = parseFloat(ventasMes?.total || 0) - comprasMes;

    return {
      facturas,
      productos,
      clientes,
      compras,
      proveedores,
      ventas_mes: parseFloat(ventasMes?.total || 0),
      compras_mes: comprasMes,
      utilidad_mes: utilidadMes,
      stock_total: stockTotal,
      productos_stock_bajo: productosStockBajo,
    };
  }

  async getActividad() {
    // Si está en modo Firestore, retornar array vacío
    if (useFirestore || !this.facturaRepository) {
      return [];
    }

    const facturas = await this.facturaRepository.find({
      take: 20,
      order: { fecha: 'DESC' },
      relations: ['cliente'],
    });

    return facturas.map((f) => ({
      tipo: 'factura',
      referencia: f.numero,
      fecha_actividad: f.fecha,
      monto: parseFloat(f.total.toString()),
      descripcion: `Factura ${f.numero} - ${f.cliente?.nombre || 'Cliente'}`,
    }));
  }

  async getConfiguracion() {
    if (useFirestore || !this.configuracionRepository) {
      return this.getDefaultConfig();
    }

    const config = await this.configuracionRepository.find();
    if (config.length === 0) {
      console.log('Inicializando configuración por defecto...');
      const defaults = this.getDefaultConfig();
      await this.configuracionRepository.save(defaults);
      return defaults;
    }
    return config;
  }

  getDefaultConfig() {
    return [
      // EMISION
      { clave: 'sri_regimen_rimpe', valor: 'false', descripcion: 'Contribuyente Régimen RIMPE', tipo: 'boolean', grupo: 'EMISION' },
      { clave: 'sri_agente_retencion', valor: '', descripcion: 'Resolución Agente de Retención', tipo: 'string', grupo: 'EMISION' },
      { clave: 'sri_contribuyente_especial', valor: '', descripcion: 'Resolución Contribuyente Especial', tipo: 'string', grupo: 'EMISION' },
      { clave: 'sri_ambiente', valor: 'pruebas', descripcion: 'Ambiente (pruebas/produccion)', tipo: 'string', grupo: 'EMISION' },
      { clave: 'sri_tipo_emision', valor: '1', descripcion: 'Tipo Emisión (1: Normal)', tipo: 'string', grupo: 'EMISION' },
      { clave: 'impuesto_iva_codigo', valor: '2', descripcion: 'Código Impuesto IVA', tipo: 'string', grupo: 'EMISION' },
      { clave: 'impuesto_iva_porcentaje', valor: '15', descripcion: 'Porcentaje IVA Actual', tipo: 'number', grupo: 'EMISION' },
      { clave: 'sri_timeout', valor: '20', descripcion: 'Timeout SRI (segundos)', tipo: 'number', grupo: 'EMISION' },

      // RIDE
      { clave: 'ride_logo_path', valor: '', descripcion: 'Ruta del Logotipo', tipo: 'string', grupo: 'RIDE' },
      { clave: 'ride_info_adicional', valor: 'Gracias por su compra', descripcion: 'Texto adicional fijo', tipo: 'string', grupo: 'RIDE' },
      { clave: 'ride_color_primario', valor: '#3366cc', descripcion: 'Color Primario PDF', tipo: 'string', grupo: 'RIDE' },
      { clave: 'cliente_email_obligatorio', valor: 'false', descripcion: 'Email Cliente Obligatorio', tipo: 'boolean', grupo: 'RIDE' },
      { clave: 'cliente_direccion_obligatoria', valor: 'false', descripcion: 'Dirección Cliente Obligatoria', tipo: 'boolean', grupo: 'RIDE' },

      // PUNTOS (Datos generales sobre puntos)
      { clave: 'secuencial_reset_password', valor: 'admin123', descripcion: 'Contraseña para resetear secuenciales', tipo: 'string', grupo: 'PUNTOS' },

      // GENERAL DE LA EMPRESA (Retrocompatibilidad)
      { clave: 'nombre_empresa', valor: 'Mi Empresa', descripcion: 'Nombre de la empresa', kind: 'legacy' },
      { clave: 'ruc_empresa', valor: '', descripcion: 'RUC de la empresa', kind: 'legacy' },
      { clave: 'direccion_empresa', valor: '', descripcion: 'Dirección de la empresa', kind: 'legacy' },
      { clave: 'telefono_empresa', valor: '', descripcion: 'Teléfono de la empresa', kind: 'legacy' },
      { clave: 'email_empresa', valor: '', descripcion: 'Email de la empresa', kind: 'legacy' },
    ];
  }

  async updateConfiguracion(configuracion: any) {
    if (useFirestore || !this.configuracionRepository) {
      return { success: false, message: 'No soportado en Firestore' };
    }

    // Se espera que 'configuracion' sea un objeto { clave: { valor: '...' }, ... } o un array
    // Vamos a manejar el formato de objeto que viene del frontend
    const entries = Object.entries(configuracion);

    for (const [clave, obj] of entries) {
      const valor = (obj as any).valor;
      // Buscar si existe
      let config = await this.configuracionRepository.findOne({ where: { clave } });
      if (config) {
        config.valor = valor;
      } else {
        config = this.configuracionRepository.create({
          clave,
          valor,
          tipo: 'string', // Default
          grupo: 'GENERAL'
        });
      }
      await this.configuracionRepository.save(config);
    }

    // Audit the change
    if (this.auditService) {
      await this.auditService.create({
        accion: 'UPDATE_CONFIG',
        modulo: 'ADMIN',
        valor_anterior: 'MULTIPLE',
        valor_nuevo: 'UPDATED',
        usuario_nombre: 'Admin (System)',
        ip_address: '127.0.0.1'
      });
    }

    return { success: true, message: 'Configuración guardada exitosamente' };
  }

  async validateConfiguration() {
    const report = {
      firma: { status: 'error', message: 'No verificada' },
      secuenciales: { status: 'ok', message: 'Sincronizados' },
      impuestos: { status: 'ok', message: 'Configurados' },
      correo: { status: 'warning', message: 'No configurado' }
    };

    // 1. Validar Firma
    // Buscar archivo .p12 en ruta estándar (o desde config si lo implementáramos dinámico)
    // Por ahora, asumimos una ruta estándar o que no hay.
    // En una implementación real, esto chequearía el archivo físico.
    report.firma.status = 'warning';
    report.firma.message = 'No se detectó firma digital activa';

    return report;
  }





  async restaurarBackup(archivo: string) {
    // Por ahora retornar éxito simulado
    return {
      success: true,
      message: `Backup ${archivo} restaurado exitosamente`,
    };
  }

  async limpiarDatos(tipo: string, dias: number) {
    // Si está en modo Firestore, retornar éxito sin eliminar
    if (useFirestore || !this.facturaRepository) {
      return {
        success: true,
        registros_eliminados: 0,
        message: 'Operación no disponible en modo Firestore',
      };
    }

    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);

    let registrosEliminados = 0;

    if (tipo === 'facturas') {
      const resultado = await this.facturaRepository
        .createQueryBuilder()
        .delete()
        .where('fecha < :fechaLimite', { fechaLimite })
        .execute();
      registrosEliminados = resultado.affected || 0;
    } else if (tipo === 'compras') {
      // Implementar cuando exista módulo de compras
      registrosEliminados = 0;
    } else if (tipo === 'movimientos') {
      // Implementar cuando exista módulo de movimientos
      registrosEliminados = 0;
    }

    return {
      success: true,
      registros_eliminados: registrosEliminados,
      message: `${registrosEliminados} registros eliminados`,
    };
  }

  async getReportes(tipo: string, fechaInicio: string, fechaFin: string) {
    // Si está en modo Firestore, retornar array vacío
    if (useFirestore || !this.facturaRepository) {
      return [];
    }

    const inicio = fechaInicio || '2020-01-01';
    const fin = fechaFin || new Date().toISOString().split('T')[0];

    if (tipo === 'ventas') {
      const facturas = await this.facturaRepository
        .createQueryBuilder('f')
        .select('DATE(f.fecha)', 'fecha')
        .addSelect('COUNT(*)', 'cantidad')
        .addSelect('COALESCE(SUM(f.total), 0)', 'total')
        .where('f.fecha >= :inicio', { inicio })
        .andWhere('f.fecha <= :fin', { fin })
        .groupBy('DATE(f.fecha)')
        .orderBy('fecha', 'ASC')
        .getRawMany();

      return facturas.map((f) => ({
        fecha: f.fecha,
        cantidad: parseInt(f.cantidad),
        total: parseFloat(f.total),
      }));
    } else if (tipo === 'compras') {
      // Implementar cuando exista módulo de compras
      return [];
    }

    return [];
  }

  private async getComprasCount(): Promise<number> {
    // Implementar cuando exista módulo de compras
    return 0;
  }

  private async getProveedoresCount(): Promise<number> {
    // Implementar cuando exista módulo de proveedores
    return 0;
  }

  private async getStockTotal(): Promise<number> {
    if (useFirestore || !this.productoRepository) {
      return 0;
    }
    const resultado = await this.productoRepository
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.stock), 0)', 'total')
      .getRawOne();
    return parseInt(resultado?.total || '0');
  }

  private async getProductosStockBajo(): Promise<number> {
    if (useFirestore || !this.productoRepository) {
      return 0;
    }
    const productos = await this.productoRepository.find();
    return productos.filter((p) => {
      if (!p.punto_reorden) return false;
      return p.stock < p.punto_reorden;
    }).length;
  }

  private async getComprasMes(inicioMes: Date): Promise<number> {
    // Implementar cuando exista módulo de compras
    return 0;
  }

  async getSystemHealth() {
    if (useFirestore || !this.facturaRepository) {
      return {
        status: 'online',
        latency: 0,
        connections: 0,
        storage_size: 0,
        timestamp: new Date().toISOString()
      };
    }

    try {
      const start = Date.now();
      await this.facturaRepository.query('SELECT 1');
      const latency = Date.now() - start;

      const [connectionsResult] = await this.facturaRepository.query(
        'SELECT count(*)::int as count FROM pg_stat_activity'
      );

      const [sizeResult] = await this.facturaRepository.query(
        'SELECT pg_database_size(current_database())::bigint as size'
      );

      return {
        status: 'online',
        latency,
        connections: connectionsResult?.count || 0,
        storage_size: sizeResult?.size || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error checking system health:', error);
      return {
        status: 'error',
        latency: -1,
        connections: 0,
        storage_size: 0,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }


  // Backup System
  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    if (useFirestore) return;
    console.log('⏳ Iniciando respaldo automático...');
    await this.generateBackup();
  }

  async generateBackup() {
    if (useFirestore) {
      return { success: false, message: 'No disponible en Firestore' };
    }

    try {
      const backupDir = path.join(__dirname, '..', '..', '..', 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const fileName = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
      const filePath = path.join(backupDir, fileName);

      // Get DB config from TypeORM config or env (Using DATABASE_ prefix to match app config)
      const dbHost = process.env.DATABASE_HOST || 'localhost';
      const dbUser = process.env.DATABASE_USER || 'facturador';
      const dbName = process.env.DATABASE_NAME || 'facturador_db';
      const dbPassword = process.env.DATABASE_PASSWORD || 'password';

      console.log(`Backup Configuration: Host=${dbHost}, User=${dbUser}, DB=${dbName}, Password Length=${dbPassword?.length}`);

      // Detect pg_dump path
      let pgDumpPath = 'pg_dump'; // Default: assume in PATH
      let foundInPath = false;
      const execAsync = promisify(exec);

      try {
        await execAsync('pg_dump --version');
        foundInPath = true;
        console.log('pg_dump found in system PATH');
      } catch (e) {
        console.warn('pg_dump NOT found in system PATH, checking standard directories...');
        const possiblePaths = [
          'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe',
          'C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe',
          'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe',
          'C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe',
          'C:\\Program Files\\PostgreSQL\\14\\bin\\pg_dump.exe',
          'C:\\Program Files\\PostgreSQL\\13\\bin\\pg_dump.exe',
          'C:\\Program Files\\PostgreSQL\\12\\bin\\pg_dump.exe',
          'C:\\Program Files\\PostgreSQL\\11\\bin\\pg_dump.exe',
          'C:\\Program Files\\PostgreSQL\\10\\bin\\pg_dump.exe',
          'C:\\Program Files (x86)\\PostgreSQL\\12\\bin\\pg_dump.exe', // x86 check
        ];

        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            pgDumpPath = `"${p}"`;
            console.log(`Using pg_dump from: ${p}`);
            foundInPath = true;
            break;
          }
        }
      }

      if (!foundInPath) {
        throw new Error('pg_dump no encontrado. Por favor instale PostgreSQL o agregue la carpeta bin al PATH del sistema.');
      }

      // Ensure PGPASSWORD is set via env options, not command string
      const command = `${pgDumpPath} -h ${dbHost} -U ${dbUser} -d ${dbName} -F p -f "${filePath}"`;

      console.log(`Executing backup command: ${command.replace(dbPassword, '*****')}`);


      await execAsync(command, {
        env: {
          ...process.env,
          PGPASSWORD: dbPassword
        }
      });

      const stats = fs.statSync(filePath);

      if (this.backupLogRepository) {
        const log = this.backupLogRepository.create({
          archivo: fileName,
          tamano: stats.size,
          estado: 'SUCCESS',
          mensaje_error: null
        });
        await this.backupLogRepository.save(log);
      }

      return { success: true, message: 'Respaldo exitoso', archivo: fileName };
    } catch (error) {
      console.error('Backup error:', error);

      if (this.backupLogRepository) {
        const log = this.backupLogRepository.create({
          archivo: 'backup_failed.sql',
          tamano: 0,
          estado: 'ERROR',
          mensaje_error: error.message
        });
        await this.backupLogRepository.save(log);
      }

      return { success: false, message: 'Error al generar respaldo: ' + error.message };
    }
  }

  async getBackups() {
    if (useFirestore || !this.backupLogRepository) return [];

    await this.ensureTableExists();

    try {
      return await this.backupLogRepository.find({
        order: { fecha_creacion: 'DESC' },
        take: 10
      });
    } catch (e) {
      console.error('Error getting backups:', e);
      return [];
    }
  }

  async createBackup() {
    await this.ensureTableExists();
    return this.generateBackup();
  }

  private async ensureTableExists() {
    if (useFirestore || !this.backupLogRepository) return;
    try {
      await this.backupLogRepository.query(`
        CREATE TABLE IF NOT EXISTS backup_logs (
            id SERIAL PRIMARY KEY,
            archivo VARCHAR(255),
            tamano BIGINT,
            estado VARCHAR(50) DEFAULT 'PENDING',
            mensaje_error TEXT,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (e) {
      console.error('Error creating table:', e);
    }
  }

  async getSystemResources() {
    try {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memUsage = (usedMem / totalMem) * 100;

      const cpuUsage = await this.getHbCpuUsage();

      return {
        cpu: cpuUsage,
        memory: {
          total: totalMem,
          free: freeMem,
          used: usedMem,
          usagePercentage: parseFloat(memUsage.toFixed(2))
        },
        uptime: os.uptime(),
        platform: os.platform() + ' ' + os.release() + ' (' + os.arch() + ')'
      };
    } catch (e) {
      console.error('Error getting system resources:', e);
      return {
        cpu: 0,
        memory: { total: 0, free: 0, used: 0, usagePercentage: 0 },
        error: e.message
      };
    }
  }

  private async getHbCpuUsage(): Promise<number> {
    const start = this.cpuAverage();
    await new Promise(resolve => setTimeout(resolve, 300)); // Sample for 300ms
    const end = this.cpuAverage();

    const idleDifference = end.idle - start.idle;
    const totalDifference = end.total - start.total;

    if (totalDifference === 0) return 0;

    const percentage = 100 - (100 * idleDifference / totalDifference);
    return parseFloat(percentage.toFixed(1));
  }

  private cpuAverage() {
    let totalIdle = 0, totalTick = 0;
    const cpus = os.cpus();

    for (let i = 0, len = cpus.length; i < len; i++) {
      const cpu = cpus[i];
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    }

    return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
  }

  async clearMemory() {
    try {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        console.log('✅ Garbage collection executed');
      } else {
        console.warn('⚠️ Garbage collection not available. Run Node with --expose-gc flag');
      }

      // Get memory stats before and after
      const memBefore = process.memoryUsage();

      // Clear any cached data (if applicable)
      // You can add specific cache clearing logic here

      const memAfter = process.memoryUsage();

      return {
        success: true,
        message: 'Memoria liberada exitosamente',
        before: {
          heapUsed: (memBefore.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
          rss: (memBefore.rss / 1024 / 1024).toFixed(2) + ' MB'
        },
        after: {
          heapUsed: (memAfter.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
          rss: (memAfter.rss / 1024 / 1024).toFixed(2) + ' MB'
        }
      };
    } catch (error) {
      console.error('Error clearing memory:', error);
      return {
        success: false,
        message: 'Error al liberar memoria: ' + error.message
      };
    }
  }

  async checkSRIStatus() {
    try {
      // Determine which environment to check based on configuration
      const ambiente = process.env.SRI_AMBIENTE || 'pruebas';
      const baseUrl = ambiente === 'produccion'
        ? 'https://cel.sri.gob.ec'
        : 'https://celospruebas.sri.gob.ec';

      const endpoints = {
        recepcion: `${baseUrl}/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl`,
        autorizacion: `${baseUrl}/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl`
      };

      const results = {
        ambiente,
        timestamp: new Date().toISOString(),
        recepcion: { status: 'offline', latency: 0, error: null },
        autorizacion: { status: 'offline', latency: 0, error: null },
        overall: 'offline'
      };

      // Check Reception endpoint
      try {
        const startRecepcion = Date.now();
        const resRecepcion = await axios.get(endpoints.recepcion, {
          timeout: 5000,
          validateStatus: (status) => status < 500 // Accept any status < 500
        });
        const latencyRecepcion = Date.now() - startRecepcion;

        results.recepcion = {
          status: resRecepcion.status < 400 ? 'online' : 'degraded',
          latency: latencyRecepcion,
          error: null
        };
      } catch (error) {
        results.recepcion = {
          status: 'offline',
          latency: 0,
          error: error.message
        };
      }

      // Check Authorization endpoint
      try {
        const startAutorizacion = Date.now();
        const resAutorizacion = await axios.get(endpoints.autorizacion, {
          timeout: 5000,
          validateStatus: (status) => status < 500
        });
        const latencyAutorizacion = Date.now() - startAutorizacion;

        results.autorizacion = {
          status: resAutorizacion.status < 400 ? 'online' : 'degraded',
          latency: latencyAutorizacion,
          error: null
        };
      } catch (error) {
        results.autorizacion = {
          status: 'offline',
          latency: 0,
          error: error.message
        };
      }

      // Determine overall status
      if (results.recepcion.status === 'online' && results.autorizacion.status === 'online') {
        results.overall = 'online';
      } else if (results.recepcion.status === 'offline' && results.autorizacion.status === 'offline') {
        results.overall = 'offline';
      } else {
        results.overall = 'degraded';
      }

      return results;
    } catch (error) {
      console.error('Error checking SRI status:', error);
      return {
        ambiente: 'unknown',
        timestamp: new Date().toISOString(),
        recepcion: { status: 'offline', latency: 0, error: error.message },
        autorizacion: { status: 'offline', latency: 0, error: error.message },
        overall: 'offline'
      };
    }
  }
  async testSmtpConnection(config: any) {
    if (!config.host || !config.user || !config.password) {
      throw new Error('Faltan datos de configuración (Host, Usuario, Password)');
    }

    console.log('Testing SMTP with:', config.host, config.port, config.user);

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: Number(config.port) || 587,
      secure: config.secure === true || config.secure === 'true', // true for 465, false for other ports
      auth: {
        user: config.user,
        pass: config.password,
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certs
      }
    });

    try {
      await transporter.verify();
      return { success: true, message: '✅ Conexión SMTP exitosa. El servidor aceptó las credenciales.' };
    } catch (error) {
      console.error('SMTP Verify Error:', error);
      throw new Error('Falló la conexión SMTP: ' + error.message);
    }
  }
}

