import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class SelectCharacterDto {
  @ApiProperty({
    example: 1,
    description: '角色ID',
  })
  @IsNumber()
  characterId: number;
} 