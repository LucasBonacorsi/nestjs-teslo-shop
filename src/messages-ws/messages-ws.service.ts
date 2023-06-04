import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isArray } from 'class-validator';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectdClients {
  [id: string]: {
    socket: Socket;
    user: User;
  };
}

@Injectable()
export class MessagesWsService {
  private connectdClients: ConnectdClients = {};

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async registerClient(client: Socket, userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('User is not active');
    this.checkUserConnection(user);
    this.connectdClients[client.id] ={
        socket: client,
        user,
    }
  }

  removeClient(client: Socket) {
    delete this.connectdClients[client.id];
  }

  getConnectedClients(): {fullName: string}[] {
    const values = Object.keys(this.connectdClients);

    if(values.length > 1) {
        return values.map((client) => ({fullName: this.connectdClients[client].user.fullName}));

    }
  }

  getUserFullName(client: Socket) {
    return this.connectdClients[client.id].user.fullName;
  }

  private checkUserConnection(user: User) {
    for (const clientId in this.connectdClients) {
        const connectedClient = this.connectdClients[clientId];
      if (this.connectdClients[clientId].user.id === user.id) {
        connectedClient.socket.disconnect();
        return true;
      }
    }
  }
}
