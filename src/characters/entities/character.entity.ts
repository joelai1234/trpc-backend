import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Character {
  @ApiProperty({
    example: 1,
    description: '角色的唯一標識符',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Howard Phillips',
    description: '角色名稱',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: '私家偵探',
    description: '角色職業',
  })
  @Column()
  occupation: string;

  @ApiProperty({
    example: 35,
    description: '角色年齡',
  })
  @Column()
  age: number;

  // 基礎屬性
  @ApiProperty({
    example: 65,
    description: '力量值 (STR)',
  })
  @Column()
  strength: number;

  @ApiProperty({
    example: 70,
    description: '體質值 (CON)',
  })
  @Column()
  constitution: number;

  @ApiProperty({
    example: 55,
    description: '體型值 (SIZ)',
  })
  @Column()
  size: number;

  @ApiProperty({
    example: 80,
    description: '敏捷值 (DEX)',
  })
  @Column()
  dexterity: number;

  @ApiProperty({
    example: 60,
    description: '外表值 (APP)',
  })
  @Column()
  appearance: number;

  @ApiProperty({
    example: 75,
    description: '智力值 (INT)',
  })
  @Column()
  intelligence: number;

  @ApiProperty({
    example: 65,
    description: '意志值 (POW)',
  })
  @Column()
  power: number;

  @ApiProperty({
    example: 70,
    description: '教育值 (EDU)',
  })
  @Column()
  education: number;

  // 衍生屬性
  @ApiProperty({
    example: 11,
    description: '當前生命值',
  })
  @Column()
  hp: number;

  @ApiProperty({
    example: 11,
    description: '最大生命值',
  })
  @Column()
  maxHp: number;

  @ApiProperty({
    example: 13,
    description: '當前魔法值',
  })
  @Column()
  mp: number;

  @ApiProperty({
    example: 13,
    description: '最大魔法值',
  })
  @Column()
  maxMp: number;

  @ApiProperty({
    example: 40,
    description: '當前理智值',
  })
  @Column()
  sanity: number;

  @ApiProperty({
    example: 99,
    description: '最大理智值',
  })
  @Column()
  maxSanity: number;

  @ApiProperty({
    example: 50,
    description: '幸運值',
  })
  @Column({ type: 'int' })
  luck: number;

  // 技能
  @ApiProperty({
    example: [
      { name: '偵查', value: 65 },
      { name: '圖書館使用', value: 50 },
      { name: '母語', value: 80 },
    ],
    description: '角色技能列表',
  })
  @Column('json')
  skills: {
    name: string;
    value: number;
    isSuccess?: boolean;
  }[];

  // 背景故事
  @ApiProperty({
    example: '這是一個充滿神秘色彩的私家偵探...',
    description: '角色背景故事',
  })
  @Column('text', { nullable: true })
  background: string;

  // 裝備
  @ApiProperty({
    example: ['手槍', '偵探筆記本', '打火機'],
    description: '角色裝備列表',
  })
  @Column('json', { nullable: true })
  equipment: string[];

  // 關聯到用戶
  @ApiProperty({
    description: '角色所屬的用戶',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.characters)
  user: User;
} 