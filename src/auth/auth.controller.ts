import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';
import { UsersService } from '../users/users.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: '註冊新用戶',
    description: '創建新的用戶帳號並返回訪問令牌',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: '用戶註冊成功',
    type: TokenDto,
  })
  @ApiResponse({
    status: 400,
    description: '用戶已存在或請求數據無效',
  })
  register(@Body() createUserDto: RegisterDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @ApiOperation({
    summary: '用戶登入',
    description: '使用用戶名和密碼登入並獲取訪問令牌',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: '登入成功',
    type: TokenDto,
  })
  @ApiResponse({
    status: 401,
    description: '用戶名或密碼錯誤',
  })
  login(@Body() signInDto: LoginDto) {
    return this.authService.login(signInDto.username, signInDto.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '獲取用戶資料',
    description: '獲取當前登入用戶的資料信息',
  })
  @ApiResponse({
    status: 200,
    description: '成功返回用戶資料',
    schema: {
      properties: {
        id: { type: 'number', example: 1 },
        username: { type: 'string', example: 'john_doe' },
        email: { type: 'string', example: 'john@example.com' },
        name: { type: 'string', example: 'John Doe' },
        isActive: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '未授權或令牌無效',
  })
  async getProfile(@Request() req) {
    const user = await this.usersService.findOne(req.user.sub);
    const { id, username, email, name, isActive } = user;
    return { id, username, email, name, isActive };
  }
} 