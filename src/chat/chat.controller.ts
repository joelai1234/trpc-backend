import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '../auth/auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('chat')
@ApiBearerAuth('access-token')
@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms/:roomId/messages')
  @ApiOperation({ summary: '獲取房間的歷史消息' })
  async getRoomMessages(@Param('roomId') roomId: number) {
    return this.chatService.getRoomMessages(roomId);
  }
} 