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
import { RoomPlayer } from 'src/rooms/entities/room-player.entity';
import { Character } from '../characters/entities/character.entity';

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

  private processingMessages: Set<string> = new Set();

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
    // 廣播用戶消息給房間內所有人
    this.server.to(`room-${data.roomId}`).emit('message', message);

    // 檢查房間狀態並生成 AI 回應
    const room = await this.roomsService.findOne(data.roomId);
    if (room.status === RoomStatus.PLAYING) {
      // 創建唯一的消息標識符
      const messageKey = `${data.roomId}-${message.id}`;
      // 檢查是否已經在處理這條消息
      if (!this.processingMessages.has(messageKey)) {
        try {
          this.processingMessages.add(messageKey);
          await this.handleAiResponse(
            data.roomId,
            client.data.user.id,
            data.content,
          );
        } finally {
          this.processingMessages.delete(messageKey);
        }
      }
    }
  }

  private getCharacterInfo(roomPlayer: RoomPlayer) {
    const character = roomPlayer?.character;
    const playerName = roomPlayer?.player.username;

    return character
      ? `
        玩家：${playerName}
        角色信息：
        姓名：${character.name}
        職業：${character.occupation}
        當前狀態：HP ${character.hp}/${character.maxHp}, MP ${character.mp}/${character.maxMp}, SAN ${character.san}/${character.maxSan}
        主要技能：${character.skills
          .filter((s) => s.value >= 50)
          .map((s) => `${s.name}(${s.value})`)
          .join('、')}
      `
      : `玩家：${playerName}（未選擇角色）`;
  }

  @SubscribeMessage('rollDice')
  async handleDiceRoll(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: number; dice: string },
  ) {
    try {
      // 創建骰子消息
      const diceMessage = await this.chatService.createDiceRollMessage(
        data.roomId,
        client.data.user.id,
        data.dice,
      );
      this.server.to(`room-${data.roomId}`).emit('message', diceMessage);

      // 檢查房間狀態並將骰子結果發送給 GM
      const room = await this.roomsService.findOne(data.roomId);
      if (room.status === RoomStatus.PLAYING) {
        const roomPlayer = room.roomPlayers.find(
          (rp) => rp.player.id === client.data.user.id,
        );

        const characterInfo = this.getCharacterInfo(roomPlayer);

        // 構建新的消息，包含骰子結果
        const messageContent = `${characterInfo}\n\n玩家擲骰：${data.dice}\n結果：${diceMessage.content}`;
        console.log('Sending dice roll to GM:', messageContent); // 添加日誌

        const gmMessage = await this.sendAiResponse(data.roomId, {
          role: 'user',
          content: messageContent,
        });

        console.log('GM response:', gmMessage); // 添加日誌
      }
    } catch (error) {
      console.error('Error handling dice roll:', error);
      const errorMessage = await this.chatService.createSystemMessage(
        data.roomId,
        'GM 暫時無法回應，請稍後再試...',
      );
      this.server.to(`room-${data.roomId}`).emit('message', errorMessage);
    }
  }

  private async sendAiResponse(
    roomId: number,
    message: { role: 'user'; content: string },
  ) {
    try {
      console.log('Generating AI response for room:', roomId); // 添加日誌
      const gmResponse = await this.aiService.generateResponse(roomId, [
        message,
      ]);
      console.log('AI response received:', gmResponse); // 添加日誌

      const gmMessage = await this.chatService.createSystemMessage(
        roomId,
        gmResponse,
      );
      console.log('System message created:', gmMessage); // 添加日誌

      this.server.to(`room-${roomId}`).emit('message', gmMessage);
      return gmMessage;
    } catch (error) {
      console.error('Error in sendAiResponse:', error);
      throw error; // 重新拋出錯誤以便上層處理
    }
  }

  private async handleAiResponse(
    roomId: number,
    userId: number,
    userMessage: string,
  ) {
    try {
      const room = await this.roomsService.findOne(roomId);
      const roomPlayer = room.roomPlayers.find((rp) => rp.player.id === userId);

      const characterInfo = this.getCharacterInfo(roomPlayer);

      await this.sendAiResponse(roomId, {
        role: 'user',
        content: `${characterInfo}\n\n玩家說：${userMessage}`,
      });
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage = await this.chatService.createSystemMessage(
        roomId,
        'GM 暫時無法回應，請稍後再試...',
      );
      this.server.to(`room-${roomId}`).emit('message', errorMessage);
    }
  }

  private generateRollResultMessage(
    character: Character,
    skillName: string,
    rollResult: number,
    isSuccess: boolean,
  ): string {
    return `${character.name} 進行 ${skillName} 檢定
        當前狀態：HP ${character.hp}/${character.maxHp}, 
        MP ${character.mp}/${character.maxMp}, 
        SAN ${character.san}/${character.maxSan}
        擲骰結果：${rollResult} (${isSuccess ? '成功' : '失敗'})`;
  }

  @SubscribeMessage('subscribeToRoom')
  async handleSubscribeToRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: number,
  ) {
    client.join(`room-${roomId}-updates`);
    const room = await this.roomsService.findOne(roomId);
    this.server.to(`room-${roomId}-updates`).emit('roomUpdate', room);
  }

  async broadcastRoomUpdate(roomId: number) {
    const room = await this.roomsService.findOne(roomId);
    this.server.to(`room-${roomId}-updates`).emit('roomUpdate', room);
  }
}
