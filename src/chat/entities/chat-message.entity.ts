import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Room } from '../../rooms/entities/room.entity';

export enum MessageType {
  CHAT = 'chat',
  SYSTEM = 'system',
  DICE = 'dice',
}

@Entity()
export class ChatMessage {
  @ApiProperty({
    example: 1,
    description: '消息ID',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'chat',
    description: '消息類型',
    enum: MessageType,
  })
  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.CHAT,
  })
  type: MessageType;

  @ApiProperty({
    example: '這是一條聊天消息',
    description: '消息內容',
  })
  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  sender: User;

  @ManyToOne(() => Room, (room) => room.messages)
  room: Room;
} 