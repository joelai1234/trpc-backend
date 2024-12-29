import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'john_doe',
    description: '用戶名',
  })
  username: string;

  @ApiProperty({
    example: 'john@example.com',
    description: '電子郵件',
  })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: '密碼',
  })
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: '用戶全名',
  })
  name: string;
} 