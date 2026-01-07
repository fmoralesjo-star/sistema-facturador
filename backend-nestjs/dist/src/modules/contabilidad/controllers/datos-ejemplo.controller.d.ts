import { DatosEjemploService } from '../services/datos-ejemplo.service';
export declare class DatosEjemploController {
    private readonly datosEjemploService;
    constructor(datosEjemploService: DatosEjemploService);
    generarDatosEjemplo(): Promise<{
        success: boolean;
        message: string;
        asientos_creados: number;
        asientos: any[];
        resumen: {
            total_facturas_simuladas: number;
            total_ventas: number;
            total_iva: number;
            total_cobros: number;
        };
    }>;
    limpiarDatosEjemplo(): Promise<{
        success: boolean;
        message: string;
        asientos_eliminados: number;
    }>;
}
