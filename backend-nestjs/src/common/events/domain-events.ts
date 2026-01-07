
export class DomainEvent {
    constructor(public readonly occurredOn: Date = new Date()) { }
}

export class InvoiceAuthorizedEvent extends DomainEvent {
    constructor(public readonly facturaId: number, public readonly sriAuthorization: string) {
        super();
    }
}

export class PurchaseCreatedEvent extends DomainEvent {
    constructor(public readonly compraId: number, public readonly proveedorId: number) {
        super();
    }
}

export class InventoryAdjustedEvent extends DomainEvent {
    constructor(public readonly movimientoId: number, public readonly productoId: number, public readonly cantidad: number) {
        super();
    }
}

export class PayrollClosedEvent extends DomainEvent {
    constructor(public readonly nominaId: number, public readonly periodo: string, public readonly totalPagar: number) {
        super();
    }
}
