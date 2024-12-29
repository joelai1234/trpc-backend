import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'john_doe',
    description: '用戶名',
  })
  username: string;

  @ApiProperty({
    example: 'password123',
    description: '密碼',
  })
  password: string;
} 