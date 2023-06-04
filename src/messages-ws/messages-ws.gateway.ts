import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wsServer: Server;

  constructor(private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
    
    ) {}

  async handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }

    this.wsServer.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  handleDisconnect(client: any) {
    this.messagesWsService.removeClient(client);
  }

  @SubscribeMessage('message-from-client')
  handleMessage(client: Socket, payload: NewMessageDto): void {
    //! Emite unicamente al cliente
    // client.emit("message-from-server", payload);

    //! Emite a todos los clientes excepto al cliente que envio el mensaje
    // client.broadcast.emit("message-from-server", payload);
    const newMessage = {
      fullName: this.messagesWsService.getUserFullName(client),
      ...payload,
    };
    this.wsServer.emit('message-from-server', newMessage);
  }
}
