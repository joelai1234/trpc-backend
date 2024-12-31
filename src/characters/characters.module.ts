import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from './entities/character.entity';
import { CharactersService } from './characters.service';
import { CharacterCreationService } from './character-creation.service';
import { CharactersController } from './characters.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Character])],
  providers: [CharactersService, CharacterCreationService],
  controllers: [CharactersController],
  exports: [CharactersService],
})
export class CharactersModule {}
