import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NotaCredito, NotaCreditoDetalle } from './entities/nota-credito.entity';
import { FacturasService } from '../facturas/facturas.service';
import { InventarioService } from '../inventario/inventario.service';
import { ContabilidadService } from '../contabilidad/contabilidad.service';
import { SriService } from '../sri/sri.service';
import { Configuracion } from '../admin/entities/configuracion.entity';

@Injectable()
export class NotasCreditoService {
    constructor(
        @InjectRepository(NotaCredito)
        private notaCreditoRepository: Repository<NotaCredito>,
        @InjectRepository(NotaCreditoDetalle)
        private detalleRepository: Repository<NotaCreditoDetalle>,
        @InjectRepository(Configuracion)
        private configuracionRepository: Repository<Configuracion>,
        private facturasService: FacturasService,
        private inventarioService: InventarioService,
        private contabilidadService: ContabilidadService,
        private sriService: SriService,
        private dataSource: DataSource,
    ) { }

    async create(createDto: {
        factura_id: number;
        motivo: string;
        detalles?: { producto_id: number; cantidad: number }[];
    }) {
        return await this.dataSource.transaction(async (manager) => {
            // 1. Obtener factura original
            const factura = await this.facturasService.findOne(createDto.factura_id);
            if (!factura) throw new NotFoundException('Factura no encontrada');

            // 2. Crear cabecera de la Nota de Crédito
            // Formato de número sugerido: Prefijo de factura + secuencial nuevo
            const prefix = factura.numero.split('-').slice(0, 2).join('-');
            const nc = manager.create(NotaCredito, {
                numero: `${prefix}-${Date.now().toString().slice(-9)}`,
                fecha: new Date(),
                factura_id: factura.id,
                cliente_id: factura.cliente_id,
                motivo: createDto.motivo,
                subtotal: 0,
                impuesto: 0,
                total: 0,
                estado: 'EMITIDO',
            });

            const ncGuardada = await manager.save(nc);

            let subtotalNC = 0;
            let impuestoNC = 0;

            // 3. Procesar detalles
            const detallesOriginales = factura.detalles || [];
            const detallesAProcesar = createDto.detalles || detallesOriginales.map(d => ({
                producto_id: d.producto_id,
                cantidad: d.cantidad
            }));

            const detallesFinales: NotaCreditoDetalle[] = [];

            for (const item of detallesAProcesar) {
                const detalleOrig = detallesOriginales.find(d => d.producto_id === item.producto_id);
                if (!detalleOrig) continue;

                const cantidad = Math.min(item.cantidad, detalleOrig.cantidad);
                const subtotal = cantidad * Number(detalleOrig.precio_unitario);

                // Obtener IVA dinámico
                const configIva = await manager.findOne(Configuracion, { where: { clave: 'impuesto_iva_porcentaje' } });
                const porcentajeIva = configIva ? parseFloat(configIva.valor) / 100 : 0.15; // Default 15%

                const impuesto = subtotal * porcentajeIva;

                const ncDetalle = manager.create(NotaCreditoDetalle, {
                    nota_credito_id: ncGuardada.id,
                    producto_id: item.producto_id,
                    cantidad: cantidad,
                    precio_unitario: Number(detalleOrig.precio_unitario),
                    subtotal: subtotal,
                });

                const savedDetalle = await manager.save(ncDetalle);
                detallesFinales.push(savedDetalle);

                subtotalNC += subtotal;
                impuestoNC += impuesto;

                // 4. Revertir stock en Inventario
                try {
                    await this.inventarioService.registrarMovimientoConActualizacion({
                        producto_id: item.producto_id,
                        tipo: 'ENTRADA',
                        cantidad: cantidad,
                        motivo: `Devolución por NC ${ncGuardada.numero}`,
                    });
                } catch (error) {
                    console.error(`Error al revertir stock para producto ${item.producto_id}:`, error);
                }
            }

            // 5. Actualizar totales de la NC
            ncGuardada.subtotal = subtotalNC;
            ncGuardada.impuesto = impuestoNC;
            ncGuardada.total = subtotalNC + impuestoNC;
            ncGuardada.detalles = detallesFinales;
            await manager.save(ncGuardada);

            // 6. Generar Asiento Contable
            try {
                await this.contabilidadService.crearAsientoNotaCredito({
                    notaCredito: ncGuardada,
                    factura: factura,
                    queryRunner: { manager } as any,
                });
            } catch (error) {
                console.error('Error al crear asiento contable para NC:', error);
            }

            // 7. Generar y enviar al SRI
            this.procesarSRIEnFondo(ncGuardada.id);

            return ncGuardada;
        });
    }

    private async procesarSRIEnFondo(ncId: number) {
        try {
            const nc = await this.findOne(ncId);
            const xml = await this.sriService.generarXMLNotaCredito(nc);
            console.log(`[SRI] XML generado para NC ${nc.numero}, listo para envío.`);
            // Aquí se llamaría a sriService.enviarAlSri si el ambiente estuviera listo
        } catch (error) {
            console.error(`Error en procesamiento SRI para NC ${ncId}:`, error);
        }
    }

    async findAll() {
        return this.notaCreditoRepository.find({ relations: ['factura', 'cliente'] });
    }

    async findOne(id: number) {
        const nc = await this.notaCreditoRepository.findOne({
            where: { id },
            relations: ['factura', 'cliente', 'detalles'],
        });
        if (!nc) throw new NotFoundException('Nota de Crédito no encontrada');
        return nc;
    }
}
