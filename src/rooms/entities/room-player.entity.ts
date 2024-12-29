import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Room } from './room.entity';
import { User } from '../../users/entities/user.entity';
import { Character } from '../../characters/entities/character.entity';

@Entity()
export class RoomPlayer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Room, (room) => room.roomPlayers)
  room: Room;

  @ManyToOne(() => User)
  player: User;

  @ManyToOne(() => Character, { nullable: true })
  character: Character | null;

  @Column({ default: false })
  isReady: boolean;
} 