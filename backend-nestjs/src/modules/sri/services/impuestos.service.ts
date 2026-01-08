import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SriRetencion, TipoRetencion } from '../entities/sri-retencion.entity';
import { Proveedor } from '../../compras/entities/proveedor.entity';

@Injectable()
export class TaxEngineService {
    constructor(
        @InjectRepository(SriRetencion)
        private retencionesRepository: Repository<SriRetencion>,
    ) { }

    /**
     * Determina automáticamente la retención de Impuesto a la Renta
     * basándose en el tipo de proveedor y el tipo de bien o servicio.
     */
    async calcularRetencionRenta(
        subtotal: number,
        tipoBien: 'BIEN' | 'SERVICIO' | 'TRANSPORTE' | 'CONSTRUCCION',
        proveedor: Proveedor
    ): Promise<{ codigo: string; porcentaje: number; valorRetenido: number; id: number }> {

        // Reglas Generales SRI (Simplificadas para 2026)

        // 1. RIMPE Emprendedor y Negocio Popular (Ventas de Bienes y Servicios)
        if (proveedor.tipo_contribuyente === 'RIMPE_EMPRENDEDOR') {
            const codigo = '343'; // 1%
            return this.buscarYCalcular(codigo, subtotal);
        }

        if (proveedor.tipo_contribuyente === 'RIMPE_NEGOCIO_POPULAR') {
            const codigo = '332'; // 0% (Generalmente notas de venta no llevan retención renta, pero en fac sí)
            return this.buscarYCalcular(codigo, subtotal);
        }

        // 2. Contribuyentes Especiales
        if (proveedor.tipo_contribuyente === 'CONTRIBUYENTE_ESPECIAL') {
            // Generalmente se retiene, pero a veces menos o nada dependiendo de quien compra.
            // Asumiendo regimen general compra a especial -> Retiene.
        }

        // 3. Reglas por Tipo de Bien/Servicio (Régimen General)
        let codigoSugerido = '312'; // Default: Transferencia de bienes muebles (1.75%)

        switch (tipoBien) {
            case 'BIEN':
                codigoSugerido = '312'; // 1.75%
                break;
            case 'SERVICIO':
                // Honorarios profesionales vs Servicio Prestado.
                // Si es persona natural: 303 (10%), Si es sociedad: 3440 (2.75%)
                if (proveedor.tipo_contribuyente === 'PERSONA_NATURAL') {
                    codigoSugerido = '303'; // 10% Honorarios
                } else {
                    codigoSugerido = '3440'; // 2.75% Otros Servicios
                }
                break;
            case 'TRANSPORTE':
                codigoSugerido = '311'; // 1%
                break;
            case 'CONSTRUCCION':
                codigoSugerido = '312A'; // 1.75%
                break;
        }

        return this.buscarYCalcular(codigoSugerido, subtotal);
    }

    /**
     * Calcula Retención IVA.
     * Generalmente 30% bienes, 70% servicios, 100% prof/arriendo.
     */
    async calcularRetencionIva(
        iva: number,
        tipoBien: 'BIEN' | 'SERVICIO',
        proveedor: Proveedor
    ): Promise<{ codigo: string; porcentaje: number; valorRetenido: number; id: number }> {
        // Si el proveedor es Contribuyente Especial, generalmente NO retenemos IVA (retienen entre ellos), 
        // salvo que nosotros seamos Agentes de Retención y ellos no.

        if (iva === 0) return { codigo: '0', porcentaje: 0, valorRetenido: 0, id: 0 };

        let codigoSugerido = '9'; // 30% Bienes

        if (tipoBien === 'SERVICIO') {
            codigoSugerido = '10'; // 70% Servicios
        }

        if (proveedor.tipo_contribuyente === 'CONTRIBUYENTE_ESPECIAL') {
            codigoSugerido = '111'; // 10% (Caso ejemplo, varía según normativa)
        }

        return this.buscarYCalcular(codigoSugerido, iva, TipoRetencion.IVA);
    }





    private async buscarYCalcular(codigo: string, baseImponible: number, tipo: TipoRetencion = TipoRetencion.RENTA) {
        const retencion = await this.retencionesRepository.findOne({ where: { codigo, tipo } });

        if (!retencion) {
            // Fallback o error
            console.warn(`Código de retención ${codigo} no encontrado en base de datos.`);
            return { codigo, porcentaje: 0, valorRetenido: 0, id: 0 };
        }

        const valorRetenido = parseFloat((baseImponible * (Number(retencion.porcentaje) / 100)).toFixed(2));

        return {
            id: retencion.id,
            codigo: retencion.codigo,
            porcentaje: Number(retencion.porcentaje),
            valorRetenido
        };
    }
}
