import { Repository } from 'typeorm';
import { SriRetencion } from '../entities/sri-retencion.entity';
import { Proveedor } from '../../compras/entities/proveedor.entity';
export declare class ImpuestosService {
    private retencionesRepository;
    constructor(retencionesRepository: Repository<SriRetencion>);
    calcularRetencionRenta(subtotal: number, tipoBien: 'BIEN' | 'SERVICIO' | 'TRANSPORTE' | 'CONSTRUCCION', proveedor: Proveedor): Promise<{
        codigo: string;
        porcentaje: number;
        valorRetenido: number;
        id: number;
    }>;
    calcularRetencionIva(iva: number, tipoBien: 'BIEN' | 'SERVICIO', proveedor: Proveedor): Promise<{
        codigo: string;
        porcentaje: number;
        valorRetenido: number;
        id: number;
    }>;
    onModuleInit(): Promise<void>;
    private inicializarMatriz;
    private buscarYCalcular;
}
