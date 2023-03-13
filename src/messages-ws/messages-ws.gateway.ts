import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly messagesWsService: MessagesWsService) {}

  handleDisconnect(client: Socket) {
    console.log('cliente desconenctado: ', client.id)
  }
  
  handleConnection(client: Socket) {
    console.log('cliente conectado: ', client.id)
  }
}
