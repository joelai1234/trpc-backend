import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Room, RoomStatus } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UsersService } from '../users/users.service';
import { ChatService } from '../chat/chat.service';
import { AiService } from '../ai/ai.service';
import { RoomPlayer } from './entities/room-player.entity';
import { CharactersService } from '../characters/characters.service';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
    @InjectRepository(RoomPlayer)
    private readonly roomPlayerRepository: Repository<RoomPlayer>,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly aiService: AiService,
    private readonly charactersService: CharactersService,
  ) {}

  private readonly defaultRelations = [
    'keeper',
    'roomPlayers',
    'roomPlayers.player',
    'roomPlayers.character',
  ];

  async findAll(): Promise<Room[]> {
    return this.roomsRepository.find({
      relations: this.defaultRelations,
    });
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomsRepository.findOne({
      where: { id },
      relations: this.defaultRelations,
    });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  async joinRoom(roomId: number, userId: number): Promise<Room> {
    const room = await this.findOne(roomId);
    const user = await this.usersService.findOne(userId);

    if (room.status !== RoomStatus.WAITING) {
      throw new BadRequestException('Room is not available for joining');
    }

    const existingPlayers = await this.roomPlayerRepository.count({
      where: { room: { id: roomId } },
    });

    if (existingPlayers >= room.maxPlayers) {
      throw new BadRequestException('Room is full');
    }

    const existingPlayer = await this.roomPlayerRepository.findOne({
      where: { room: { id: roomId }, player: { id: userId } },
    });

    if (!existingPlayer) {
      const roomPlayer = this.roomPlayerRepository.create({
        room,
        player: user,
        isReady: false,
      });
      await this.roomPlayerRepository.save(roomPlayer);
    }

    return this.findOne(roomId);
  }

  async leaveRoom(roomId: number, userId: number): Promise<Room | null> {
    const room = await this.findOne(roomId);
    const leavingUser = await this.usersService.findOne(userId);

    await this.roomPlayerRepository.delete({
      room: { id: roomId },
      player: { id: userId },
    });

    const remainingPlayers = await this.roomPlayerRepository.find({
      where: { room: { id: roomId } },
      relations: ['player'],
    });

    await this.chatService.createSystemMessage(
      roomId,
      `${leavingUser.username} 離開了房間。`,
    );

    if (room.keeper.id === userId) {
      if (remainingPlayers.length > 0) {
        room.keeper = remainingPlayers[0].player;
        await this.chatService.createSystemMessage(
          roomId,
          `${room.keeper.username} 成為了新的房主。`,
        );
        await this.roomsRepository.save(room);
      } else {
        room.status = RoomStatus.ENDED;
        await this.chatService.createSystemMessage(
          roomId,
          '所有玩家已離開，房間已關閉。',
        );
        await this.roomsRepository.save(room);
        return null;
      }
    }

    return this.findOne(roomId);
  }

  async selectCharacter(
    roomId: number,
    userId: number,
    characterId: number,
  ): Promise<Room> {
    const roomPlayer = await this.roomPlayerRepository.findOne({
      where: { room: { id: roomId }, player: { id: userId } },
      relations: ['character'],
    });

    if (!roomPlayer) {
      throw new BadRequestException('Player is not in this room');
    }

    const existingSelection = await this.roomPlayerRepository.findOne({
      where: {
        room: { id: roomId },
        character: { id: characterId },
        player: { id: Not(userId) },
      },
    });

    if (existingSelection) {
      throw new BadRequestException(
        'Character is already selected by another player',
      );
    }

    const character = await this.charactersService.findOne(characterId);
    if (!character) {
      throw new NotFoundException('Character not found');
    }

    roomPlayer.character = character;
    roomPlayer.isReady = true;
    await this.roomPlayerRepository.save(roomPlayer);

    return this.findOne(roomId);
  }

  async create(createRoomDto: CreateRoomDto, userId: number): Promise<Room> {
    const keeper = await this.usersService.findOne(userId);
    const room = this.roomsRepository.create({
      ...createRoomDto,
      keeper,
    });
    const savedRoom = await this.roomsRepository.save(room);
    const roomPlayer = this.roomPlayerRepository.create({
      room: savedRoom,
      player: keeper,
    });
    await this.roomPlayerRepository.save(roomPlayer);
    return this.findOne(savedRoom.id);
  }

  async remove(id: number, userId: number): Promise<void> {
    const room = await this.findOne(id);
    if (room.keeper.id !== userId) {
      throw new BadRequestException('Only keeper can remove the room');
    }
    room.status = RoomStatus.ENDED;
    await this.chatService.createSystemMessage(id, '房主已關閉房間。');
    await this.roomsRepository.save(room);
  }

  async startGame(roomId: number, userId: number): Promise<Room> {
    const room = await this.findOne(roomId);

    if (room.keeper.id !== userId) {
      throw new BadRequestException('Only keeper can start the game');
    }

    if (room.status !== RoomStatus.WAITING) {
      throw new BadRequestException('Room is not in waiting status');
    }

    const unreadyPlayers = await this.roomPlayerRepository.count({
      where: {
        room: { id: roomId },
        isReady: false,
      },
    });

    if (unreadyPlayers > 0) {
      throw new BadRequestException(
        'Not all players have selected their characters',
      );
    }

    if (!room.script) {
      throw new BadRequestException('Room script is required to start game');
    }

    room.status = RoomStatus.PLAYING;
    await this.roomsRepository.save(room);

    await this.chatService.createSystemMessage(
      roomId,
      '遊戲開始！GM已加入房間。',
    );

    this.generateGmOpeningResponse(room);

    return room;
  }

  private async generateGmOpeningResponse(room: Room) {
    try {
      const playersInfo = await Promise.all(
        room.roomPlayers.map(async (rp) => {
          const character = rp.character;
          return {
            playerName: rp.player.username,
            characterName: character.name,
            occupation: character.occupation,
            strength: character.strength,
            constitution: character.constitution,
            size: character.size,
            dexterity: character.dexterity,
            appearance: character.appearance,
            intelligence: character.intelligence,
            power: character.power,
            education: character.education,
            hp: character.hp,
            maxHp: character.maxHp,
            mp: character.mp,
            maxMp: character.maxMp,
            sanity: character.sanity,
            maxSanity: character.maxSanity,
            luck: character.luck,
            skills: character.skills,
            background: character.background,
            equipment: character.equipment,
          };
        }),
      );

      const playersDescription = playersInfo
        .map(
          (info) =>
            `玩家 ${info.playerName} 扮演 ${info.characterName}
           職業：${info.occupation}
           
           基礎屬性：
           力量: ${info.strength}, 體質: ${info.constitution}, 體型: ${info.size}
           敏捷: ${info.dexterity}, 外表: ${info.appearance}
           智力: ${info.intelligence}, 意志: ${info.power}, 教育: ${info.education}
           
           當前狀態：
           生命值: ${info.hp}/${info.maxHp}
           魔法值: ${info.mp}/${info.maxMp}
           理智值: ${info.sanity}/${info.maxSanity}
           幸運值: ${info.luck}
           
           技能：
           ${info.skills
             .filter((s) => s.value >= 50)
             .map((s) => `${s.name}(${s.value})`)
             .join('、')}
           
           裝備：
           ${info.equipment?.join('、') || '無'}
           
           背景：
           ${info.background || '無'}`,
        )
        .join('\n\n');

      const gmResponse = await this.aiService.generateResponse(room.id, [
        {
          role: 'user',
          content: `作為GM，請根據以下信息開始遊戲：

           劇本：
           ${room.script}

           參與角色詳細信息：
           ${playersDescription}
           
           請提供開場白，描述場景並帶入角色。在描述中可以參考角色的屬性、技能和背景來增加代入感。`,
        },
      ]);

      await this.chatService.createSystemMessage(room.id, gmResponse);
    } catch (error) {
      console.error('Error generating GM opening response:', error);
      await this.chatService.createSystemMessage(
        room.id,
        '讓我們開始今天的冒險...',
      );
    }
  }
}
