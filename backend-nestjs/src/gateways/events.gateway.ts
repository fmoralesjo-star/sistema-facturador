import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://sistema-faacturador-a510e.web.app'],
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  // Emitir eventos personalizados
  emitFacturaCreada(factura: any) {
    this.server.emit('factura-creada', factura);
  }

  emitFacturaActualizada(factura: any) {
    this.server.emit('factura-actualizada', factura);
  }

  emitClienteCreado(cliente: any) {
    this.server.emit('cliente-creado', cliente);
  }

  emitClienteActualizado(cliente: any) {
    this.server.emit('cliente-actualizado', cliente);
  }

  emitProductoCreado(producto: any) {
    this.server.emit('producto-creado', producto);
  }

  emitProductoActualizado(producto: any) {
    this.server.emit('producto-actualizado', producto);
  }

  emitProductoEliminado(id: string | number) {
    this.server.emit('producto-eliminado', { id });
  }

  emitContabilidadActualizada() {
    this.server.emit('contabilidad-actualizada');
  }

  emitInventarioActualizado() {
    this.server.emit('inventario-actualizado');
  }

  emitCompraCreada(compra: any) {
    this.server.emit('compra-creada', compra);
  }

  emitCompraActualizada(compra: any) {
    this.server.emit('compra-actualizada', compra);
  }

  emitStockBajo(data: any) {
    this.server.emit('stock-bajo', data);
  }

  emitUsuarioCreado(usuario: any) {
    this.server.emit('usuario-creado', usuario);
  }

  emitUsuarioActualizado(usuario: any) {
    this.server.emit('usuario-actualizado', usuario);
  }

  emitUsuarioEliminado(id: string | number) {
    this.server.emit('usuario-eliminado', { id });
  }
}

