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
    description: '職業 (Occupation)',
  })
  @Column()
  occupation: string;

  @ApiProperty({
    example: 35,
    description: '年齡 (Age)',
  })
  @Column()
  age: number;

  // Core Characteristics
  @ApiProperty({
    example: 50,
    description: 'STR (力量值) - 3D6×5 (15-90)',
  })
  @Column({ name: 'str' })
  str: number;

  @ApiProperty({
    example: 50,
    description: 'CON (體質值) - 3D6×5 (15-90)',
  })
  @Column({ name: 'con' })
  con: number;

  @ApiProperty({
    example: 65,
    description: 'SIZ (體型值) - (2D6+6)×5 (40-90)',
  })
  @Column({ name: 'siz' })
  siz: number;

  @ApiProperty({
    example: 50,
    description: 'DEX (敏捷值) - 3D6×5 (15-90)',
  })
  @Column({ name: 'dex' })
  dex: number;

  @ApiProperty({
    example: 50,
    description: 'APP (外表值) - 3D6×5 (15-90)',
  })
  @Column({ name: 'app' })
  app: number;

  @ApiProperty({
    example: 65,
    description: 'INT (智力值) - (2D6+6)×5 (40-90)',
  })
  @Column({ name: 'int' })
  int: number;

  @ApiProperty({
    example: 50,
    description: 'POW (意志值) - 3D6×5 (15-90)',
  })
  @Column({ name: 'pow' })
  pow: number;

  @ApiProperty({
    example: 65,
    description: 'EDU (教育值) - (2D6+6)×5 (40-90)',
  })
  @Column({ name: 'edu' })
  edu: number;

  // Derived Attributes
  @ApiProperty({
    example: 13,
    description: 'HP (生命值) = (CON + SIZ) / 10',
  })
  @Column({ name: 'hp' })
  hp: number;

  @ApiProperty({
    example: 13,
    description: 'Max HP (最大生命值) = (CON + SIZ) / 10',
  })
  @Column({ name: 'max_hp' })
  maxHp: number;

  @ApiProperty({
    example: 5,
    description: 'MP (魔法值) = POW / 10',
  })
  @Column({ name: 'mp' })
  mp: number;

  @ApiProperty({
    example: 5,
    description: 'Max MP (最大魔法值) = POW / 10',
  })
  @Column({ name: 'max_mp' })
  maxMp: number;

  @ApiProperty({
    example: 50,
    description: 'SAN (理智值) = POW',
  })
  @Column({ name: 'san' })
  san: number;

  @ApiProperty({
    example: 50,
    description: 'Max SAN (最大理智值) = POW',
  })
  @Column({ name: 'max_san' })
  maxSan: number;

  @ApiProperty({
    example: 50,
    description: 'LUCK (幸運值) - 3D6×5 (15-90)',
  })
  @Column({ name: 'luck' })
  luck: number;

  @ApiProperty({
    example: 8,
    description: 'MOV (移動速率) - 基於STR、DEX和SIZ比較',
  })
  @Column({ name: 'mov' })
  mov: number;

  // Skills
  @ApiProperty({
    example: [
      { name: '偵查', value: 65, isOccupational: true },
      { name: '圖書館使用', value: 50, isOccupational: true },
      { name: '母語', value: 80, isOccupational: false },
    ],
    description: '技能列表 (包含職業技能和興趣技能)',
  })
  @Column('json')
  skills: {
    name: string;
    value: number;
    isOccupational: boolean;
  }[];

  // Background
  @ApiProperty({
    example: '這是一個充滿神秘色彩的私家偵探...',
    description: '角色背景故事',
  })
  @Column('text', { nullable: true })
  background: string;

  // Equipment
  @ApiProperty({
    example: ['手槍', '偵探筆記本', '打火機'],
    description: '裝備列表',
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