import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SriRetencion, TipoRetencion } from '../entities/sri-retencion.entity';
import { Proveedor } from '../../compras/entities/proveedor.entity';

@Injectable()
export class ImpuestosService {
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

    async onModuleInit() {
        // Deshabilitado temporalmente para asegurar despliegue
        console.log('⚠️ Inicialización de matriz de impuestos OMITIDA');
    }

    private async inicializarMatriz() {
        const count = await this.retencionesRepository.count();
        if (count > 0) return;

        const retenciones = [
            // RENTA
            { codigo: '312', descripcion: 'Transferencia de bienes muebles de naturaleza corporal', porcentaje: 1.75, tipo: TipoRetencion.RENTA },
            { codigo: '303', descripcion: 'Honorarios profesionales y demás pagos por servicios (PN)', porcentaje: 10.00, tipo: TipoRetencion.RENTA },
            { codigo: '3440', descripcion: 'Otras compras de bienes y servicios no sujetas a retención', porcentaje: 2.75, tipo: TipoRetencion.RENTA }, // 2.75% Otros Servicios
            { codigo: '343', descripcion: '1% Rimpe Emprendedor (Bienes y Servicios)', porcentaje: 1.00, tipo: TipoRetencion.RENTA },
            { codigo: '332', descripcion: '0% Rimpe Negocio Popular (Notas de Venta)', porcentaje: 0.00, tipo: TipoRetencion.RENTA },
            { codigo: '311', descripcion: 'Servicios de transporte privado de pasajeros o carga', porcentaje: 1.00, tipo: TipoRetencion.RENTA },
            { codigo: '312A', descripcion: 'Sector Construcción', porcentaje: 1.75, tipo: TipoRetencion.RENTA },

            // IVA
            { codigo: '9', descripcion: 'Retención IVA 30% (Bienes)', porcentaje: 30.00, tipo: TipoRetencion.IVA },
            { codigo: '10', descripcion: 'Retención IVA 70% (Servicios)', porcentaje: 70.00, tipo: TipoRetencion.IVA },
            { codigo: '111', descripcion: 'Retención IVA 100% (Arriendos/Honorarios)', porcentaje: 100.00, tipo: TipoRetencion.IVA },
            { codigo: '1', descripcion: 'Retención IVA 10% (Entre Contribuyentes Especiales)', porcentaje: 10.00, tipo: TipoRetencion.IVA },
            { codigo: '0', descripcion: 'Sin Retención', porcentaje: 0.00, tipo: TipoRetencion.RENTA },
        ];

        for (const r of retenciones) {
            await this.retencionesRepository.save(this.retencionesRepository.create(r));
        }
        console.log('✅ Matriz de Retenciones SRI 2026 Inicializada');
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
