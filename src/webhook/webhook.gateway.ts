import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../common/redis/redis.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: false,
  },
  transports: ['websocket', 'polling'],
})
export class WebhookGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private logger = new Logger('WebhookGateway');

  constructor(private redis: RedisService) {}

  afterInit() {
    // subscribe to all webhook channels using pattern
    // channel format: webhook:<slug>
    this.redis.subscribePattern('webhook:*', (channel, message) => {
      const slug = channel.replace('webhook:', '');
      // emit to all clients watching this slug's room
       console.log(`Gateway received message on channel: ${channel}`); 
      this.server.to(`room:${slug}`).emit('new_request', JSON.parse(message));
    });

    this.logger.log('WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // client sends { slug } to join a room and watch that endpoint
  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { slug: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `room:${data.slug}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined ${room}`);
    return { event: 'joined', room };
  }

  // client sends { slug } to stop watching
  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @MessageBody() data: { slug: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `room:${data.slug}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left ${room}`);
    return { event: 'left', room };
  }
}
