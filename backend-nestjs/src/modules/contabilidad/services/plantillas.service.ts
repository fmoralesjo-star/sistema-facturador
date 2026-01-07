import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantillaAsiento } from '../entities/plantilla-asiento.entity';
import { PlantillaDetalle, TipoMovimiento, TipoValor } from '../entities/plantilla-detalle.entity';
import { PartidaContable } from '../entities/partida-contable.entity';
import { Factura } from '../../facturas/entities/factura.entity';
import { CuentaContable } from '../entities/cuenta-contable.entity';

@Injectable()
export class PlantillasService {
    constructor(
        @InjectRepository(PlantillaAsiento)
        private plantillaRepository: Repository<PlantillaAsiento>,
        @InjectRepository(CuentaContable)
        private cuentaRepository: Repository<CuentaContable>,
    ) { }

    /**
     * Genera las partidas de un asiento basándose en una plantilla
     */
    async procesarPlantilla(
        codigoPlantilla: string,
        datos: {
            factura?: Factura;
            total?: number;
            subtotal?: number;
            iva?: number;
            cliente_id?: number;
            proveedor_id?: number;
            usuario_id?: number;
            caja_id?: number;
            retencion_renta?: number;
            retencion_iva?: number;
        }
    ): Promise<PartidaContable[]> {
        const plantilla = await this.plantillaRepository.findOne({
            where: { codigo: codigoPlantilla, activo: true },
            relations: ['detalles']
        });

        if (!plantilla) {
            // Si no existe la plantilla, se podría crear una por defecto para evitar bloqueo
            // pero lo ideal es lanzar error para que se configure.
            // Para "Sincronizar", si no existe, retornamos vacío para no romper el loop
            console.warn(`Plantilla ${codigoPlantilla} no encontrada. Saltando generación.`);
            return [];
        }

        const partidas: PartidaContable[] = [];

        // Ordenar detalles
        const detalles = plantilla.detalles.sort((a, b) => a.orden - b.orden);

        // Pre-cargar mapa de cuentas por código para evitar N queries
        const codigosCuentas = detalles
            .filter(d => !d.cuenta_codigo.startsWith('@'))
            .map(d => d.cuenta_codigo);

        // Agregar códigos de mapeo dinámico comunes si no están
        // TODO: Mapeo dinámico sólido

        for (const detalle of detalles) {
            const monto = this.calcularValor(detalle, datos);

            // Si el monto es 0, no generar partida (salvo configuración específica)
            if (monto === 0) continue;

            const cuentaId = await this.resolverCuenta(detalle.cuenta_codigo, datos);
            if (!cuentaId) {
                console.warn(`No se pudo resolver cuenta para código ${detalle.cuenta_codigo}`);
                continue;
            }

            const partida = new PartidaContable();
            partida.cuenta_id = cuentaId;
            partida.debe = detalle.tipo_movimiento === TipoMovimiento.DEBE ? monto : 0;
            partida.haber = detalle.tipo_movimiento === TipoMovimiento.HABER ? monto : 0;

            // Asignar auxiliares
            if (detalle.cuenta_codigo === '@CLIENTE_CXC' || detalle.cuenta_codigo.includes('CLIENTE')) {
                partida.tercero_id = datos.cliente_id;
                partida.tercero_tipo = 'CLIENTE';
            } else if (detalle.cuenta_codigo.includes('PROVEEDOR')) {
                partida.tercero_id = datos.proveedor_id;
                partida.tercero_tipo = 'PROVEEDOR';
            }

            partidas.push(partida);
        }

        return partidas;
    }

    private calcularValor(detalle: PlantillaDetalle, datos: any): number {
        let valorBase = 0;

        switch (detalle.tipo_valor) {
            case TipoValor.TOTAL:
                valorBase = datos.total || 0;
                break;
            case TipoValor.SUBTOTAL_0:
            case TipoValor.SUBTOTAL_15:
                valorBase = datos.subtotal || 0; // Simplificado
                break;
            case TipoValor.IVA:
                valorBase = datos.iva || 0;
                break;
            case TipoValor.DESCUENTO:
                valorBase = datos.descuento || 0;
                break;
            case TipoValor.VALOR_FIJO:
                valorBase = 1;
                break;
            case TipoValor.RETENCION_RENTA:
                valorBase = datos.retencion_renta || 0;
                break;
            case TipoValor.RETENCION_IVA:
                valorBase = datos.retencion_iva || 0;
                break;
        }

        return parseFloat((valorBase * (detalle.porcentaje / 100)).toFixed(2));
    }

    private async resolverCuenta(codigo: string, datos: any): Promise<number> {
        // 1. Códigos directos
        if (!codigo.startsWith('@')) {
            const cuenta = await this.cuentaRepository.findOne({ where: { codigo } });
            return cuenta ? cuenta.id : 0;
        }

        // 2. Mapeo de comodines a códigos del Plan de Cuentas Básico SRI
        let codigoDestino = '';

        switch (codigo) {
            case '@CLIENTE_CXC':
                codigoDestino = '1.1.02.01'; // Cuentas por Cobrar Clientes
                break;
            case '@VENTAS_BIENES':
                codigoDestino = '4.1.01.01'; // Venta de Bienes
                break;
            case '@VENTAS_SERVICIOS':
                codigoDestino = '4.1.02.01'; // Venta de Servicios
                break;
            case '@IVA_VENTAS':
                codigoDestino = '2.1.02.01'; // IVA por Pagar (Ventas) -- Corregido de 2.1.04.01 a 2.1.02.01 según seed
                break;
            case '@CAJA_GENERAL':
                codigoDestino = '1.1.01.01'; // Caja General
                break;
            case '@BANCOS':
                codigoDestino = '1.1.01.02'; // Bancos
                break;
            case '@INVENTARIO':
                codigoDestino = '1.1.03.01'; // Inventario de Mercaderías
                break;
            case '@PROVEEDOR_CXP':
                codigoDestino = '2.1.01.01'; // Cuentas por Pagar Proveedores
                break;
            case '@GASTO_COMPRA': // Para cuando no es inventario
                codigoDestino = '5.1.01.01'; // Compras Netas / Gastos
                break;
            case '@IVA_COMPRAS':
                codigoDestino = '1.1.04.01'; // Crédito Tributario IVA (Activo)
                break;
            case '@RET_RENTA_POR_PAGAR':
                codigoDestino = '2.1.02.02'; // Retenciones en la Fuente por Pagar
                break;
            case '@RET_IVA_POR_PAGAR':
                codigoDestino = '2.1.02.01'; // Reutilizamos IVA por Pagar o creamos cuenta específica de Retención IVA si existe
                // Por norma, Retención IVA también es un pasivo tributario. 
                // Si el plan básico tiene "2.1.02.02 Retenciones...", usaremos esa o la misma de Renta si no distinguen.
                // Revisando seed: 2.1.02.02 es "Retenciones en la Fuente por Pagar". 
                // Usaremos esa misma para ambas por simplicidad, o idealmente separar.
                codigoDestino = '2.1.02.02';
                break;
            default:
                return 0;
        }

        const cuenta = await this.cuentaRepository.findOne({ where: { codigo: codigoDestino } });

        // Fallback: Si no encuentra la cuenta específica, buscar la superior
        if (!cuenta) {
            // Intentar buscar nivel superior (ej. 1.1.01)
            const parts = codigoDestino.split('.');
            if (parts.length > 2) {
                const parentCode = parts.slice(0, parts.length - 1).join('.');
                const parent = await this.cuentaRepository.findOne({ where: { codigo: parentCode } });
                if (parent) return parent.id;
            }
            console.warn(`No se encontró cuenta para comodín ${codigo} -> ${codigoDestino}`);
            return 0;
        }

        return cuenta.id;
    }
}
