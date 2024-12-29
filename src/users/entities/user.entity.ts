import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Character } from '../../characters/entities/character.entity';
import { Room } from '../../rooms/entities/room.entity';

@Entity()
export class User {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the user',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'john_doe',
    description: 'The username of the user',
  })
  @Column({ unique: true })
  username: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'The email of the user',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
  })
  @Column()
  @Exclude()
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: true,
    description: 'Whether the user is active',
  })
  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Character, (character) => character.user)
  characters: Character[];

  @OneToMany(() => Room, (room) => room.keeper)
  ownedRooms: Room[];
}
