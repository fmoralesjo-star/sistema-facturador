import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    emitFacturaCreada(factura: any): void;
    emitFacturaActualizada(factura: any): void;
    emitClienteCreado(cliente: any): void;
    emitClienteActualizado(cliente: any): void;
    emitProductoCreado(producto: any): void;
    emitProductoActualizado(producto: any): void;
    emitProductoEliminado(id: string | number): void;
    emitContabilidadActualizada(): void;
    emitInventarioActualizado(): void;
    emitCompraCreada(compra: any): void;
    emitCompraActualizada(compra: any): void;
    emitStockBajo(data: any): void;
    emitUsuarioCreado(usuario: any): void;
    emitUsuarioActualizado(usuario: any): void;
    emitUsuarioEliminado(id: string | number): void;
}
