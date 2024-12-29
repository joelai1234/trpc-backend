import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { AuthGuard } from '../auth/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AiService } from '../ai/ai.service';
import { SelectCharacterDto } from './dto/select-character.dto';

@ApiTags('rooms')
@ApiBearerAuth('access-token')
@Controller('rooms')
@UseGuards(AuthGuard)
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly aiService: AiService,
  ) {}

  @Post()
  @ApiOperation({ summary: '創建房間' })
  async create(@Request() req, @Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: '獲取房間列表' })
  async findAll() {
    return this.roomsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '獲取房間詳情' })
  async findOne(@Param('id') id: number) {
    return this.roomsService.findOne(id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: '加入房間' })
  async join(@Param('id') id: number, @Request() req) {
    return this.roomsService.joinRoom(id, req.user.sub);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: '離開房間' })
  async leave(@Param('id') id: number, @Request() req) {
    return this.roomsService.leaveRoom(id, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: '關閉房間' })
  async remove(@Param('id') id: number, @Request() req) {
    return this.roomsService.remove(id, req.user.sub);
  }

  @Post(':id/start')
  @ApiOperation({ summary: '開始遊戲' })
  async startGame(@Param('id') id: number, @Request() req) {
    return this.roomsService.startGame(id, req.user.sub);
  }

  @Post(':id/select-character')
  @ApiOperation({ summary: '選擇角色' })
  async selectCharacter(
    @Param('id') id: number,
    @Request() req,
    @Body() selectCharacterDto: SelectCharacterDto,
  ) {
    return this.roomsService.selectCharacter(
      id,
      req.user.sub,
      selectCharacterDto.characterId,
    );
  }
} 