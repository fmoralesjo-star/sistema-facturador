import { Factura } from '../../facturas/entities/factura.entity';
export declare class XsdValidationService {
    validarFactura(factura: Factura): boolean;
    private validarIdentificacion;
    private validarCedula;
    private validarEmail;
}
