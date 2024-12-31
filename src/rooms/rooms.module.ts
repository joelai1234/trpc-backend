import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { Room } from './entities/room.entity';
import { RoomPlayer } from './entities/room-player.entity';
import { UsersModule } from '../users/users.module';
import { ChatModule } from '../chat/chat.module';
import { AiModule } from '../ai/ai.module';
import { CharactersModule } from '../characters/characters.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, RoomPlayer]),
    UsersModule,
    CharactersModule,
    forwardRef(() => ChatModule),
    AiModule,
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
