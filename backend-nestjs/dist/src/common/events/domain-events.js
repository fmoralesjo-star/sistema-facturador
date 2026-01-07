"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollClosedEvent = exports.InventoryAdjustedEvent = exports.PurchaseCreatedEvent = exports.InvoiceAuthorizedEvent = exports.DomainEvent = void 0;
class DomainEvent {
    constructor(occurredOn = new Date()) {
        this.occurredOn = occurredOn;
    }
}
exports.DomainEvent = DomainEvent;
class InvoiceAuthorizedEvent extends DomainEvent {
    constructor(facturaId, sriAuthorization) {
        super();
        this.facturaId = facturaId;
        this.sriAuthorization = sriAuthorization;
    }
}
exports.InvoiceAuthorizedEvent = InvoiceAuthorizedEvent;
class PurchaseCreatedEvent extends DomainEvent {
    constructor(compraId, proveedorId) {
        super();
        this.compraId = compraId;
        this.proveedorId = proveedorId;
    }
}
exports.PurchaseCreatedEvent = PurchaseCreatedEvent;
class InventoryAdjustedEvent extends DomainEvent {
    constructor(movimientoId, productoId, cantidad) {
        super();
        this.movimientoId = movimientoId;
        this.productoId = productoId;
        this.cantidad = cantidad;
    }
}
exports.InventoryAdjustedEvent = InventoryAdjustedEvent;
class PayrollClosedEvent extends DomainEvent {
    constructor(nominaId, periodo, totalPagar) {
        super();
        this.nominaId = nominaId;
        this.periodo = periodo;
        this.totalPagar = totalPagar;
    }
}
exports.PayrollClosedEvent = PayrollClosedEvent;
//# sourceMappingURL=domain-events.js.map