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
exports.DatosEjemploService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const asiento_contable_entity_1 = require("../entities/asiento-contable.entity");
const partida_contable_entity_1 = require("../entities/partida-contable.entity");
const cuenta_contable_entity_1 = require("../entities/cuenta-contable.entity");
const plan_cuentas_service_1 = require("./plan-cuentas.service");
let DatosEjemploService = class DatosEjemploService {
    constructor(asientoRepository, partidaRepository, cuentaRepository, planCuentasService) {
        this.asientoRepository = asientoRepository;
        this.partidaRepository = partidaRepository;
        this.cuentaRepository = cuentaRepository;
        this.planCuentasService = planCuentasService;
    }
    async generarDatosEjemplo() {
        try {
            const cuentasExistentes = await this.cuentaRepository.count();
            if (cuentasExistentes === 0) {
                await this.planCuentasService.inicializarPlanBasico();
            }
            const cuentaClientes = await this.cuentaRepository.findOne({
                where: { codigo: '1.1.02' },
            });
            const cuentaVentas = await this.cuentaRepository.findOne({
                where: { codigo: '4.1.01' },
            });
            const cuentaIVA = await this.cuentaRepository.findOne({
                where: { codigo: '2.1.02' },
            });
            const cuentaCaja = await this.cuentaRepository.findOne({
                where: { codigo: '1.1.01' },
            });
            if (!cuentaClientes || !cuentaVentas || !cuentaIVA) {
                throw new Error('Cuentas contables no encontradas. Ejecute primero /api/plan-cuentas/inicializar');
            }
            const asientosCreados = [];
            const fecha1 = new Date('2024-01-15');
            const asiento1 = this.asientoRepository.create({
                numero_asiento: 'AS-EJEMPLO-001',
                fecha: fecha1,
                descripcion: 'Factura Ejemplo FAC-001 - Venta de productos',
                tipo: 'VENTA',
                total_debe: 115.0,
                total_haber: 115.0,
            });
            const asiento1Guardado = await this.asientoRepository.save(asiento1);
            await this.partidaRepository.save([
                {
                    asiento_id: asiento1Guardado.id,
                    cuenta_id: cuentaClientes.id,
                    debe: 115.0,
                    haber: 0,
                    descripcion: 'Factura FAC-001 - Clientes / Cuentas por Cobrar',
                },
                {
                    asiento_id: asiento1Guardado.id,
                    cuenta_id: cuentaVentas.id,
                    debe: 0,
                    haber: 100.0,
                    descripcion: 'Factura FAC-001 - Ventas',
                },
                {
                    asiento_id: asiento1Guardado.id,
                    cuenta_id: cuentaIVA.id,
                    debe: 0,
                    haber: 15.0,
                    descripcion: 'Factura FAC-001 - IVA Cobrado',
                },
            ]);
            asientosCreados.push(asiento1Guardado.id);
            const fecha2 = new Date('2024-01-20');
            const asiento2 = this.asientoRepository.create({
                numero_asiento: 'AS-EJEMPLO-002',
                fecha: fecha2,
                descripcion: 'Factura Ejemplo FAC-002 - Venta de servicios',
                tipo: 'VENTA',
                total_debe: 287.5,
                total_haber: 287.5,
            });
            const asiento2Guardado = await this.asientoRepository.save(asiento2);
            await this.partidaRepository.save([
                {
                    asiento_id: asiento2Guardado.id,
                    cuenta_id: cuentaClientes.id,
                    debe: 287.5,
                    haber: 0,
                    descripcion: 'Factura FAC-002 - Clientes / Cuentas por Cobrar',
                },
                {
                    asiento_id: asiento2Guardado.id,
                    cuenta_id: cuentaVentas.id,
                    debe: 0,
                    haber: 250.0,
                    descripcion: 'Factura FAC-002 - Ventas',
                },
                {
                    asiento_id: asiento2Guardado.id,
                    cuenta_id: cuentaIVA.id,
                    debe: 0,
                    haber: 37.5,
                    descripcion: 'Factura FAC-002 - IVA Cobrado',
                },
            ]);
            asientosCreados.push(asiento2Guardado.id);
            const fecha3 = new Date('2024-01-25');
            const asiento3 = this.asientoRepository.create({
                numero_asiento: 'AS-EJEMPLO-003',
                fecha: fecha3,
                descripcion: 'Factura Ejemplo FAC-003 - Venta mayorista',
                tipo: 'VENTA',
                total_debe: 575.0,
                total_haber: 575.0,
            });
            const asiento3Guardado = await this.asientoRepository.save(asiento3);
            await this.partidaRepository.save([
                {
                    asiento_id: asiento3Guardado.id,
                    cuenta_id: cuentaClientes.id,
                    debe: 575.0,
                    haber: 0,
                    descripcion: 'Factura FAC-003 - Clientes / Cuentas por Cobrar',
                },
                {
                    asiento_id: asiento3Guardado.id,
                    cuenta_id: cuentaVentas.id,
                    debe: 0,
                    haber: 500.0,
                    descripcion: 'Factura FAC-003 - Ventas',
                },
                {
                    asiento_id: asiento3Guardado.id,
                    cuenta_id: cuentaIVA.id,
                    debe: 0,
                    haber: 75.0,
                    descripcion: 'Factura FAC-003 - IVA Cobrado',
                },
            ]);
            asientosCreados.push(asiento3Guardado.id);
            if (cuentaCaja) {
                const fecha4 = new Date('2024-01-28');
                const asiento4 = this.asientoRepository.create({
                    numero_asiento: 'AS-EJEMPLO-004',
                    fecha: fecha4,
                    descripcion: 'Cobro de factura FAC-001',
                    tipo: 'ACTIVO',
                    total_debe: 115.0,
                    total_haber: 115.0,
                });
                const asiento4Guardado = await this.asientoRepository.save(asiento4);
                await this.partidaRepository.save([
                    {
                        asiento_id: asiento4Guardado.id,
                        cuenta_id: cuentaCaja.id,
                        debe: 115.0,
                        haber: 0,
                        descripcion: 'Cobro FAC-001 - Caja',
                    },
                    {
                        asiento_id: asiento4Guardado.id,
                        cuenta_id: cuentaClientes.id,
                        debe: 0,
                        haber: 115.0,
                        descripcion: 'Cobro FAC-001 - Clientes',
                    },
                ]);
                asientosCreados.push(asiento4Guardado.id);
            }
            return {
                success: true,
                message: 'Datos de ejemplo generados exitosamente',
                asientos_creados: asientosCreados.length,
                asientos: asientosCreados,
                resumen: {
                    total_facturas_simuladas: 3,
                    total_ventas: 850.0,
                    total_iva: 127.5,
                    total_cobros: cuentaCaja ? 115.0 : 0,
                },
            };
        }
        catch (error) {
            throw new Error(`Error al generar datos de ejemplo: ${error.message}`);
        }
    }
    async limpiarDatosEjemplo() {
        try {
            const asientosEjemplo = await this.asientoRepository.find({
                where: {},
            });
            const asientosAEliminar = asientosEjemplo.filter((a) => a.numero_asiento.startsWith('AS-EJEMPLO-'));
            let eliminados = 0;
            for (const asiento of asientosAEliminar) {
                await this.partidaRepository.delete({ asiento_id: asiento.id });
                await this.asientoRepository.remove(asiento);
                eliminados++;
            }
            return {
                success: true,
                message: 'Datos de ejemplo eliminados',
                asientos_eliminados: eliminados,
            };
        }
        catch (error) {
            throw new Error(`Error al limpiar datos de ejemplo: ${error.message}`);
        }
    }
};
exports.DatosEjemploService = DatosEjemploService;
exports.DatosEjemploService = DatosEjemploService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(asiento_contable_entity_1.AsientoContable)),
    __param(1, (0, typeorm_1.InjectRepository)(partida_contable_entity_1.PartidaContable)),
    __param(2, (0, typeorm_1.InjectRepository)(cuenta_contable_entity_1.CuentaContable)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        plan_cuentas_service_1.PlanCuentasService])
], DatosEjemploService);
//# sourceMappingURL=datos-ejemplo.service.js.map