import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatMessage } from './entities/chat-message.entity';
import { RoomsModule } from '../rooms/rooms.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { AiModule } from '../ai/ai.module';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage]),
    forwardRef(() => RoomsModule),
    UsersModule,
    AuthModule,
    AiModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatGateway,
    ChatService,
  ],
  exports: [ChatService],
})
export class ChatModule {} 