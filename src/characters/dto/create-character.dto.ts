import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateCharacterDto {
  @ApiProperty({ example: 'Howard Phillips', description: '角色名稱' })
  name: string;

  @ApiProperty({ example: '私家偵探', description: '職業' })
  occupation: string;

  @ApiProperty({ example: 35, description: '年齡' })
  age: number;

  @ApiProperty({ example: 65, description: '力量值' })
  strength: number;

  @ApiProperty({ example: 70, description: '體質值' })
  constitution: number;

  @ApiProperty({ example: 55, description: '體型值' })
  size: number;

  @ApiProperty({ example: 80, description: '敏捷值' })
  dexterity: number;

  @ApiProperty({ example: 60, description: '外表值' })
  appearance: number;

  @ApiProperty({ example: 75, description: '智力值' })
  intelligence: number;

  @ApiProperty({ example: 65, description: '意志值' })
  power: number;

  @ApiProperty({ example: 70, description: '教育值' })
  education: number;

  @ApiProperty({
    example: [
      { name: '偵查', value: 65 },
      { name: '圖書館使用', value: 50 },
      { name: '母語', value: 80 },
    ],
    description: '技能列表',
  })
  skills: {
    name: string;
    value: number;
    isSuccess?: boolean;
  }[];

  @ApiProperty({
    example: '這是一個充滿神秘色彩的私家偵探...',
    description: '角色背景故事',
  })
  background?: string;

  @ApiProperty({
    example: ['手槍', '偵探筆記本', '打火機'],
    description: '裝備列表',
  })
  equipment?: string[];

  @ApiPropertyOptional({
    example: 11,
    description: '當前生命值 (自動計算)',
  })
  hp?: number;

  @ApiPropertyOptional({
    example: 11,
    description: '最大生命值 (自動計算)',
  })
  maxHp?: number;

  @ApiPropertyOptional({
    example: 13,
    description: '當前魔法值 (自動計算)',
  })
  mp?: number;

  @ApiPropertyOptional({
    example: 13,
    description: '最大魔法值 (自動計算)',
  })
  maxMp?: number;

  @ApiPropertyOptional({
    example: 40,
    description: '當前理智值 (自動計算)',
  })
  sanity?: number;

  @ApiPropertyOptional({
    example: 99,
    description: '最大理智值 (自動計算)',
  })
  maxSanity?: number;

  @ApiProperty({
    example: 50,
    description: '幸運值',
  })
  @IsNumber()
  luck: number;
} 