import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards, forwardRef, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from '../auth/ws-auth.guard';
import { ChatService } from './chat.service';
import { AiService } from '../ai/ai.service';
import { RoomStatus } from '../rooms/entities/room.entity';
import { RoomsService } from '../rooms/rooms.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
@UseGuards(WsAuthGuard)
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly aiService: AiService,
    @Inject(forwardRef(() => RoomsService))
    private readonly roomsService: RoomsService,
  ) {}

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: number,
  ) {
    client.join(`room-${roomId}`);
    // 發送系統消息通知有新用戶加入
    const message = await this.chatService.createSystemMessage(
      roomId,
      `${client.data.user.username} 加入了房間`,
    );
    this.server.to(`room-${roomId}`).emit('message', message);
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: number,
  ) {
    client.leave(`room-${roomId}`);
    // 發送系統消息通知用戶離開
    const message = await this.chatService.createSystemMessage(
      roomId,
      `${client.data.user.username} 離開了房間`,
    );
    this.server.to(`room-${roomId}`).emit('message', message);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: number; content: string },
  ) {
    const message = await this.chatService.createMessage(
      data.roomId,
      client.data.user.id,
      data.content,
    );
    this.server.to(`room-${data.roomId}`).emit('message', message);

    // Get room status and generate AI response if game is in progress
    const room = await this.roomsService.findOne(data.roomId);
    if (room.status === RoomStatus.PLAYING) {
      // 傳入 userId 到 handleAiResponse
      this.handleAiResponse(data.roomId, client.data.user.id, data.content);
    }
  }

  // 新增私有方法處理 AI 回應
  private async handleAiResponse(
    roomId: number,
    userId: number,
    userMessage: string,
  ) {
    try {
      const room = await this.roomsService.findOne(roomId);
      
      const roomPlayer = room.roomPlayers.find((rp) => rp.player.id === userId);
      const character = roomPlayer?.character;
      const playerName = roomPlayer?.player.username;

      const characterInfo = character
        ? `
          玩家：${playerName}
          角色信息：
          姓名：${character.name}
          職業：${character.occupation}
          當前狀態：HP ${character.hp}/${character.maxHp}, MP ${character.mp}/${character.maxMp}, SAN ${character.sanity}/${character.maxSanity}
          主要技能：${character.skills
            .filter((s) => s.value >= 50)
            .map((s) => `${s.name}(${s.value})`)
            .join('、')}
        `
        : `玩家：${playerName}（未選擇角色）`;

      const gmResponse = await this.aiService.generateResponse(roomId, [
        {
          role: 'user',
          content: `${characterInfo}\n\n玩家說：${userMessage}`,
        },
      ]);

      const gmMessage = await this.chatService.createSystemMessage(
        roomId,
        gmResponse,
      );

      this.server.to(`room-${roomId}`).emit('message', gmMessage);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage = await this.chatService.createSystemMessage(
        roomId,
        'GM 暫時無法回應，請稍後再試...',
      );
      this.server.to(`room-${roomId}`).emit('message', errorMessage);
    }
  }

  @SubscribeMessage('rollDice')
  async handleDiceRoll(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: number; dice: string },
  ) {
    const result = await this.chatService.createDiceRollMessage(
      data.roomId,
      client.data.user.id,
      data.dice,
    );
    this.server.to(`room-${data.roomId}`).emit('message', result);
  }
} 