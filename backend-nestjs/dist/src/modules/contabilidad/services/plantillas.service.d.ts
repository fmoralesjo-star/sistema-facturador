import { Repository } from 'typeorm';
import { PlantillaAsiento } from '../entities/plantilla-asiento.entity';
import { PartidaContable } from '../entities/partida-contable.entity';
import { Factura } from '../../facturas/entities/factura.entity';
import { CuentaContable } from '../entities/cuenta-contable.entity';
export declare class PlantillasService {
    private plantillaRepository;
    private cuentaRepository;
    constructor(plantillaRepository: Repository<PlantillaAsiento>, cuentaRepository: Repository<CuentaContable>);
    procesarPlantilla(codigoPlantilla: string, datos: {
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
    }): Promise<PartidaContable[]>;
    private calcularValor;
    private resolverCuenta;
}
