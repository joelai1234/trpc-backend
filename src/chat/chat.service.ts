import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage, MessageType } from './entities/chat-message.entity';
import { RoomsService } from '../rooms/rooms.service';
import { UsersService } from '../users/users.service';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    @Inject(forwardRef(() => RoomsService))
    private roomsService: RoomsService,
    private usersService: UsersService,
    @Inject(forwardRef(() => ChatGateway))
    private chatGateway: ChatGateway,
  ) {}

  async createMessage(
    roomId: number,
    userId: number,
    content: string,
  ): Promise<ChatMessage> {
    const room = await this.roomsService.findOne(roomId);
    const user = await this.usersService.findOne(userId);

    const message = this.chatMessageRepository.create({
      type: MessageType.CHAT,
      content,
      sender: user,
      room,
    });

    const savedMessage = await this.chatMessageRepository.save(message);
    
    const server = this.chatGateway.server;
    if (server) {
      server.to(`room-${roomId}`).emit('message', savedMessage);
    }

    return savedMessage;
  }

  async createSystemMessage(
    roomId: number,
    content: string,
  ): Promise<ChatMessage> {
    const room = await this.roomsService.findOne(roomId);

    const message = this.chatMessageRepository.create({
      type: MessageType.SYSTEM,
      content,
      room,
    });

    const savedMessage = await this.chatMessageRepository.save(message);
    
    const server = this.chatGateway.server;
    if (server) {
      server.to(`room-${roomId}`).emit('message', savedMessage);
    }

    return savedMessage;
  }

  async createDiceRollMessage(
    roomId: number,
    userId: number,
    dice: string,
  ): Promise<ChatMessage> {
    const room = await this.roomsService.findOne(roomId);
    const user = await this.usersService.findOne(userId);

    const [count, faces] = dice.toLowerCase().split('d').map(Number);
    const rolls = Array.from(
      { length: count },
      () => Math.floor(Math.random() * faces) + 1,
    );
    const total = rolls.reduce((sum, roll) => sum + roll, 0);

    const content = `🎲 ${user.username} 擲出了 ${dice}: [${rolls.join(
      ', ',
    )}] = ${total}`;

    const message = this.chatMessageRepository.create({
      type: MessageType.DICE,
      content,
      sender: user,
      room,
    });

    const savedMessage = await this.chatMessageRepository.save(message);
    
    const server = this.chatGateway.server;
    if (server) {
      server.to(`room-${roomId}`).emit('message', savedMessage);
    }

    return savedMessage;
  }

  async getRoomMessages(roomId: number): Promise<ChatMessage[]> {
    return this.chatMessageRepository.find({
      where: { room: { id: roomId } },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
} 