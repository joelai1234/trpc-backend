import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SkillDto {
  @ApiProperty({ example: '偵查', description: '技能名稱' })
  @IsString()
  name: string;

  @ApiProperty({ example: 65, description: '技能值 (0-99)' })
  @IsNumber()
  @Min(0)
  @Max(99)
  value: number;

  @ApiProperty({ example: true, description: '是否為職業技能' })
  @IsBoolean()
  isOccupational: boolean;
}

export class CreateCharacterDto {
  @ApiProperty({ example: 'Howard Phillips', description: '角色名稱' })
  name: string;

  @ApiProperty({ example: '私家偵探', description: '職業 (Occupation)' })
  occupation: string;

  @ApiProperty({ example: 35, description: '年齡 (Age)' })
  @IsNumber()
  @Min(15)
  @Max(90)
  age: number;

  @ApiProperty({ example: 50, description: 'STR (力量值) - 3D6×5 (15-90)' })
  @IsNumber()
  @Min(15)
  @Max(90)
  str: number;

  @ApiProperty({ example: 50, description: 'CON (體質值) - 3D6×5 (15-90)' })
  @IsNumber()
  @Min(15)
  @Max(90)
  con: number;

  @ApiProperty({ example: 65, description: 'SIZ (體型值) - (2D6+6)×5 (40-90)' })
  @IsNumber()
  @Min(40)
  @Max(90)
  siz: number;

  @ApiProperty({ example: 50, description: 'DEX (敏捷值) - 3D6×5 (15-90)' })
  @IsNumber()
  @Min(15)
  @Max(90)
  dex: number;

  @ApiProperty({ example: 50, description: 'APP (外表值) - 3D6×5 (15-90)' })
  @IsNumber()
  @Min(15)
  @Max(90)
  app: number;

  @ApiProperty({ example: 65, description: 'INT (智力值) - (2D6+6)×5 (40-90)' })
  @IsNumber()
  @Min(40)
  @Max(90)
  int: number;

  @ApiProperty({ example: 50, description: 'POW (意志值) - 3D6×5 (15-90)' })
  @IsNumber()
  @Min(15)
  @Max(90)
  pow: number;

  @ApiProperty({ example: 65, description: 'EDU (教育值) - (2D6+6)×5 (40-90)' })
  @IsNumber()
  @Min(40)
  @Max(90)
  edu: number;

  @ApiProperty({ example: 50, description: 'LUCK (幸運值) - 3D6×5 (15-90)' })
  @IsNumber()
  @Min(15)
  @Max(90)
  luck: number;

  @ApiProperty({ type: [SkillDto], description: '技能列表 (職業技能和興趣技能)' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills: SkillDto[];

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
    example: 13,
    description: 'HP (生命值) = (CON + SIZ) / 10',
  })
  hp?: number;

  @ApiPropertyOptional({
    example: 13,
    description: 'Max HP (最大生命值) = (CON + SIZ) / 10',
  })
  maxHp?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'MP (魔法值) = POW / 10',
  })
  mp?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Max MP (最大魔法值) = POW / 10',
  })
  maxMp?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'SAN (理智值) = POW',
  })
  san?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Max SAN (最大理智值) = POW',
  })
  maxSan?: number;

  @ApiPropertyOptional({
    example: 8,
    description: 'MOV (移動速率) - 基於STR、DEX和SIZ比較',
  })
  @IsOptional()
  @IsNumber()
  @Min(7)
  @Max(9)
  mov?: number;
} 