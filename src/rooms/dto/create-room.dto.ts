import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    example: '克蘇魯的呼喚',
    description: '房間名稱',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '適合新手的劇本...',
    description: '房間描述',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 5,
    description: '最大玩家數量',
  })
  @IsNumber()
  @Min(1)
  @Max(10)
  maxPlayers: number;

  @ApiProperty({
    example: '在一個風雨交加的夜晚，偵探事務所接到一通神秘的電話...',
    description: '劇本內容',
  })
  @IsString()
  @IsOptional()
  script?: string;
} 