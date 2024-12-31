import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CharactersService } from './characters.service';
import { Character } from './entities/character.entity';
import { CreateCharacterDto } from './dto/create-character.dto';
import { AuthGuard } from '../auth/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';

@ApiTags('characters')
@ApiBearerAuth('access-token')
@Controller('characters')
@UseGuards(AuthGuard)
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Post()
  @ApiOperation({
    summary: '創建新角色',
    description: '創建一個新的 COC 7E 角色',
  })
  @ApiBody({ type: CreateCharacterDto })
  @ApiResponse({
    status: 201,
    description: '角色創建成功',
    type: Character,
  })
  @ApiResponse({ status: 401, description: '未授權' })
  async create(@Request() req, @Body() characterData: CreateCharacterDto) {
    const user = new User();
    user.id = req.user.sub;

    const data = {
      ...characterData,
      user,
    };
    return this.charactersService.create(data);
  }

  @Get()
  @ApiOperation({
    summary: '獲取當前用戶的所有角色',
    description: '返回當前登錄用戶創建的所有角色列表',
  })
  @ApiResponse({
    status: 200,
    description: '成功返回角色列表',
    type: [Character],
  })
  @ApiResponse({ status: 401, description: '未授權' })
  async findAll(@Request() req) {
    return this.charactersService.findByUser(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({
    summary: '獲取特定角色詳情',
    description: '根據角色ID返回詳細信息',
  })
  @ApiParam({ name: 'id', description: '角色ID' })
  @ApiResponse({
    status: 200,
    description: '成功返回角色信息',
    type: Character,
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async findOne(@Param('id') id: number) {
    return this.charactersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: '更新角色信息',
    description: '更新指定角色的信息',
  })
  @ApiParam({ name: 'id', description: '角色ID' })
  @ApiBody({ type: CreateCharacterDto })
  @ApiResponse({
    status: 200,
    description: '角色更新成功',
    type: Character,
  })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async update(
    @Param('id') id: number,
    @Body() characterData: Partial<CreateCharacterDto>,
  ) {
    return this.charactersService.update(id, characterData);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '刪除角色',
    description: '刪除指定的角色',
  })
  @ApiParam({ name: 'id', description: '角色ID' })
  @ApiResponse({ status: 200, description: '角色刪除成功' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async remove(@Param('id') id: number) {
    return this.charactersService.remove(id);
  }
}
