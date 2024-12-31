import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { ChatMessage } from '../../chat/entities/chat-message.entity';
import { RoomPlayer } from './room-player.entity';

export enum RoomStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  ENDED = 'ended',
}

@Entity()
export class Room {
  @ApiProperty({
    example: 1,
    description: '房間ID',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '克蘇魯的呼喚',
    description: '房間名稱',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: '適合新手的劇本...',
    description: '房間描述',
  })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({
    example: 'waiting',
    description: '房間狀態',
    enum: RoomStatus,
  })
  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.WAITING,
  })
  status: RoomStatus;

  @ApiProperty({
    example: 5,
    description: '最大玩家數量',
  })
  @Column({ default: 5 })
  maxPlayers: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.hostedRooms)
  host: User;

  @OneToMany(() => RoomPlayer, (roomPlayer) => roomPlayer.room)
  roomPlayers: RoomPlayer[];

  @OneToMany(() => ChatMessage, (message) => message.room)
  messages: ChatMessage[];

  @ApiProperty({
    example: '在一個風雨交加的夜晚，偵探事務所接到一通神秘的電話...',
    description: '劇本內容',
  })
  @Column('text', { nullable: true })
  script: string;

  @DeleteDateColumn()
  deletedAt?: Date;
}
