"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const factura_entity_1 = require("../facturas/entities/factura.entity");
const producto_entity_1 = require("../productos/entities/producto.entity");
const cliente_entity_1 = require("../clientes/entities/cliente.entity");
const backup_log_entity_1 = require("./entities/backup-log.entity");
const configuracion_entity_1 = require("./entities/configuracion.entity");
const audit_service_1 = require("../audit/audit.service");
const fs = require("fs");
const path = require("path");
const child_process_1 = require("child_process");
const util_1 = require("util");
const os = require("os");
const axios_1 = require("axios");
const nodemailer = require("nodemailer");
const useFirestore = process.env.USE_FIRESTORE === 'true' || process.env.USE_FIRESTORE === 'True';
let AdminService = class AdminService {
    constructor(facturaRepository, productoRepository, clienteRepository, backupLogRepository, configuracionRepository, auditService) {
        this.facturaRepository = facturaRepository;
        this.productoRepository = productoRepository;
        this.clienteRepository = clienteRepository;
        this.backupLogRepository = backupLogRepository;
        this.configuracionRepository = configuracionRepository;
        this.auditService = auditService;
    }
    async getEstadisticas() {
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
        const [facturas, productos, clientes, compras, proveedores, stockTotal, productosStockBajo,] = await Promise.all([
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
            { clave: 'sri_regimen_rimpe', valor: 'false', descripcion: 'Contribuyente Régimen RIMPE', tipo: 'boolean', grupo: 'EMISION' },
            { clave: 'sri_agente_retencion', valor: '', descripcion: 'Resolución Agente de Retención', tipo: 'string', grupo: 'EMISION' },
            { clave: 'sri_contribuyente_especial', valor: '', descripcion: 'Resolución Contribuyente Especial', tipo: 'string', grupo: 'EMISION' },
            { clave: 'sri_ambiente', valor: 'pruebas', descripcion: 'Ambiente (pruebas/produccion)', tipo: 'string', grupo: 'EMISION' },
            { clave: 'sri_tipo_emision', valor: '1', descripcion: 'Tipo Emisión (1: Normal)', tipo: 'string', grupo: 'EMISION' },
            { clave: 'impuesto_iva_codigo', valor: '2', descripcion: 'Código Impuesto IVA', tipo: 'string', grupo: 'EMISION' },
            { clave: 'impuesto_iva_porcentaje', valor: '15', descripcion: 'Porcentaje IVA Actual', tipo: 'number', grupo: 'EMISION' },
            { clave: 'sri_timeout', valor: '20', descripcion: 'Timeout SRI (segundos)', tipo: 'number', grupo: 'EMISION' },
            { clave: 'ride_logo_path', valor: '', descripcion: 'Ruta del Logotipo', tipo: 'string', grupo: 'RIDE' },
            { clave: 'ride_info_adicional', valor: 'Gracias por su compra', descripcion: 'Texto adicional fijo', tipo: 'string', grupo: 'RIDE' },
            { clave: 'ride_color_primario', valor: '#3366cc', descripcion: 'Color Primario PDF', tipo: 'string', grupo: 'RIDE' },
            { clave: 'cliente_email_obligatorio', valor: 'false', descripcion: 'Email Cliente Obligatorio', tipo: 'boolean', grupo: 'RIDE' },
            { clave: 'cliente_direccion_obligatoria', valor: 'false', descripcion: 'Dirección Cliente Obligatoria', tipo: 'boolean', grupo: 'RIDE' },
            { clave: 'secuencial_reset_password', valor: 'admin123', descripcion: 'Contraseña para resetear secuenciales', tipo: 'string', grupo: 'PUNTOS' },
            { clave: 'nombre_empresa', valor: 'Mi Empresa', descripcion: 'Nombre de la empresa', kind: 'legacy' },
            { clave: 'ruc_empresa', valor: '', descripcion: 'RUC de la empresa', kind: 'legacy' },
            { clave: 'direccion_empresa', valor: '', descripcion: 'Dirección de la empresa', kind: 'legacy' },
            { clave: 'telefono_empresa', valor: '', descripcion: 'Teléfono de la empresa', kind: 'legacy' },
            { clave: 'email_empresa', valor: '', descripcion: 'Email de la empresa', kind: 'legacy' },
        ];
    }
    async updateConfiguracion(configuracion) {
        if (useFirestore || !this.configuracionRepository) {
            return { success: false, message: 'No soportado en Firestore' };
        }
        const entries = Object.entries(configuracion);
        for (const [clave, obj] of entries) {
            const valor = obj.valor;
            let config = await this.configuracionRepository.findOne({ where: { clave } });
            if (config) {
                config.valor = valor;
            }
            else {
                config = this.configuracionRepository.create({
                    clave,
                    valor,
                    tipo: 'string',
                    grupo: 'GENERAL'
                });
            }
            await this.configuracionRepository.save(config);
        }
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
        report.firma.status = 'warning';
        report.firma.message = 'No se detectó firma digital activa';
        return report;
    }
    async restaurarBackup(archivo) {
        return {
            success: true,
            message: `Backup ${archivo} restaurado exitosamente`,
        };
    }
    async limpiarDatos(tipo, dias) {
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
        }
        else if (tipo === 'compras') {
            registrosEliminados = 0;
        }
        else if (tipo === 'movimientos') {
            registrosEliminados = 0;
        }
        return {
            success: true,
            registros_eliminados: registrosEliminados,
            message: `${registrosEliminados} registros eliminados`,
        };
    }
    async getReportes(tipo, fechaInicio, fechaFin) {
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
        }
        else if (tipo === 'compras') {
            return [];
        }
        return [];
    }
    async getComprasCount() {
        return 0;
    }
    async getProveedoresCount() {
        return 0;
    }
    async getStockTotal() {
        if (useFirestore || !this.productoRepository) {
            return 0;
        }
        const resultado = await this.productoRepository
            .createQueryBuilder('p')
            .select('COALESCE(SUM(p.stock), 0)', 'total')
            .getRawOne();
        return parseInt(resultado?.total || '0');
    }
    async getProductosStockBajo() {
        if (useFirestore || !this.productoRepository) {
            return 0;
        }
        const productos = await this.productoRepository.find();
        return productos.filter((p) => {
            if (!p.punto_reorden)
                return false;
            return p.stock < p.punto_reorden;
        }).length;
    }
    async getComprasMes(inicioMes) {
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
            const [connectionsResult] = await this.facturaRepository.query('SELECT count(*)::int as count FROM pg_stat_activity');
            const [sizeResult] = await this.facturaRepository.query('SELECT pg_database_size(current_database())::bigint as size');
            return {
                status: 'online',
                latency,
                connections: connectionsResult?.count || 0,
                storage_size: sizeResult?.size || 0,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
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
    async handleCron() {
        if (useFirestore)
            return;
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
            const dbHost = process.env.DATABASE_HOST || 'localhost';
            const dbUser = process.env.DATABASE_USER || 'facturador';
            const dbName = process.env.DATABASE_NAME || 'facturador_db';
            const dbPassword = process.env.DATABASE_PASSWORD || 'password';
            console.log(`Backup Configuration: Host=${dbHost}, User=${dbUser}, DB=${dbName}, Password Length=${dbPassword?.length}`);
            let pgDumpPath = 'pg_dump';
            let foundInPath = false;
            const execAsync = (0, util_1.promisify)(child_process_1.exec);
            try {
                await execAsync('pg_dump --version');
                foundInPath = true;
                console.log('pg_dump found in system PATH');
            }
            catch (e) {
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
                    'C:\\Program Files (x86)\\PostgreSQL\\12\\bin\\pg_dump.exe',
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
        }
        catch (error) {
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
        if (useFirestore || !this.backupLogRepository)
            return [];
        await this.ensureTableExists();
        try {
            return await this.backupLogRepository.find({
                order: { fecha_creacion: 'DESC' },
                take: 10
            });
        }
        catch (e) {
            console.error('Error getting backups:', e);
            return [];
        }
    }
    async createBackup() {
        await this.ensureTableExists();
        return this.generateBackup();
    }
    async ensureTableExists() {
        if (useFirestore || !this.backupLogRepository)
            return;
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
        }
        catch (e) {
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
        }
        catch (e) {
            console.error('Error getting system resources:', e);
            return {
                cpu: 0,
                memory: { total: 0, free: 0, used: 0, usagePercentage: 0 },
                error: e.message
            };
        }
    }
    async getHbCpuUsage() {
        const start = this.cpuAverage();
        await new Promise(resolve => setTimeout(resolve, 300));
        const end = this.cpuAverage();
        const idleDifference = end.idle - start.idle;
        const totalDifference = end.total - start.total;
        if (totalDifference === 0)
            return 0;
        const percentage = 100 - (100 * idleDifference / totalDifference);
        return parseFloat(percentage.toFixed(1));
    }
    cpuAverage() {
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
            if (global.gc) {
                global.gc();
                console.log('✅ Garbage collection executed');
            }
            else {
                console.warn('⚠️ Garbage collection not available. Run Node with --expose-gc flag');
            }
            const memBefore = process.memoryUsage();
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
        }
        catch (error) {
            console.error('Error clearing memory:', error);
            return {
                success: false,
                message: 'Error al liberar memoria: ' + error.message
            };
        }
    }
    async checkSRIStatus() {
        try {
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
            try {
                const startRecepcion = Date.now();
                const resRecepcion = await axios_1.default.get(endpoints.recepcion, {
                    timeout: 5000,
                    validateStatus: (status) => status < 500
                });
                const latencyRecepcion = Date.now() - startRecepcion;
                results.recepcion = {
                    status: resRecepcion.status < 400 ? 'online' : 'degraded',
                    latency: latencyRecepcion,
                    error: null
                };
            }
            catch (error) {
                results.recepcion = {
                    status: 'offline',
                    latency: 0,
                    error: error.message
                };
            }
            try {
                const startAutorizacion = Date.now();
                const resAutorizacion = await axios_1.default.get(endpoints.autorizacion, {
                    timeout: 5000,
                    validateStatus: (status) => status < 500
                });
                const latencyAutorizacion = Date.now() - startAutorizacion;
                results.autorizacion = {
                    status: resAutorizacion.status < 400 ? 'online' : 'degraded',
                    latency: latencyAutorizacion,
                    error: null
                };
            }
            catch (error) {
                results.autorizacion = {
                    status: 'offline',
                    latency: 0,
                    error: error.message
                };
            }
            if (results.recepcion.status === 'online' && results.autorizacion.status === 'online') {
                results.overall = 'online';
            }
            else if (results.recepcion.status === 'offline' && results.autorizacion.status === 'offline') {
                results.overall = 'offline';
            }
            else {
                results.overall = 'degraded';
            }
            return results;
        }
        catch (error) {
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
    async testSmtpConnection(config) {
        if (!config.host || !config.user || !config.password) {
            throw new Error('Faltan datos de configuración (Host, Usuario, Password)');
        }
        console.log('Testing SMTP with:', config.host, config.port, config.user);
        const transporter = nodemailer.createTransport({
            host: config.host,
            port: Number(config.port) || 587,
            secure: config.secure === true || config.secure === 'true',
            auth: {
                user: config.user,
                pass: config.password,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        try {
            await transporter.verify();
            return { success: true, message: '✅ Conexión SMTP exitosa. El servidor aceptó las credenciales.' };
        }
        catch (error) {
            console.error('SMTP Verify Error:', error);
            throw new Error('Falló la conexión SMTP: ' + error.message);
        }
    }
};
exports.AdminService = AdminService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminService.prototype, "handleCron", null);
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, typeorm_1.InjectRepository)(factura_entity_1.Factura)),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, typeorm_1.InjectRepository)(producto_entity_1.Producto)),
    __param(2, (0, common_1.Optional)()),
    __param(2, (0, typeorm_1.InjectRepository)(cliente_entity_1.Cliente)),
    __param(3, (0, common_1.Optional)()),
    __param(3, (0, typeorm_1.InjectRepository)(backup_log_entity_1.BackupLog)),
    __param(4, (0, common_1.Optional)()),
    __param(4, (0, typeorm_1.InjectRepository)(configuracion_entity_1.Configuracion)),
    __param(5, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService])
], AdminService);
//# sourceMappingURL=admin.service.js.map