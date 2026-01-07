export declare class DomainEvent {
    readonly occurredOn: Date;
    constructor(occurredOn?: Date);
}
export declare class InvoiceAuthorizedEvent extends DomainEvent {
    readonly facturaId: number;
    readonly sriAuthorization: string;
    constructor(facturaId: number, sriAuthorization: string);
}
export declare class PurchaseCreatedEvent extends DomainEvent {
    readonly compraId: number;
    readonly proveedorId: number;
    constructor(compraId: number, proveedorId: number);
}
export declare class InventoryAdjustedEvent extends DomainEvent {
    readonly movimientoId: number;
    readonly productoId: number;
    readonly cantidad: number;
    constructor(movimientoId: number, productoId: number, cantidad: number);
}
export declare class PayrollClosedEvent extends DomainEvent {
    readonly nominaId: number;
    readonly periodo: string;
    readonly totalPagar: number;
    constructor(nominaId: number, periodo: string, totalPagar: number);
}
