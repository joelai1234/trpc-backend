import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from './entities/character.entity';
import { CharacterCreationService } from './character-creation.service';

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(Character)
    private charactersRepository: Repository<Character>,
    private characterCreationService: CharacterCreationService,
  ) {}

  async create(characterData: Partial<Character>): Promise<Character> {
    // 確保所有必要的屬性都存在
    if (!this.validateRequiredAttributes(characterData)) {
      throw new BadRequestException('缺少必要的角色屬性');
    }

    // Validate core characteristics
    this.characterCreationService.validateCoreCharacteristics({
      str: characterData.str!,
      con: characterData.con!,
      siz: characterData.siz!,
      dex: characterData.dex!,
      app: characterData.app!,
      int: characterData.int!,
      pow: characterData.pow!,
      edu: characterData.edu!,
    });

    // Validate skill points distribution
    this.validateSkillPoints(characterData);

    // Calculate derived attributes
    const derivedAttributes = this.characterCreationService.calculateDerivedAttributes({
      con: characterData.con,
      siz: characterData.siz,
      pow: characterData.pow,
      str: characterData.str,
      dex: characterData.dex,
    });

    const character = this.charactersRepository.create({
      ...characterData,
      ...derivedAttributes,
    });

    return this.charactersRepository.save(character);
  }

  private validateSkillPoints(characterData: Partial<Character>) {
    const { occupationalPoints, personalInterestPoints } = 
      this.characterCreationService.calculateSkillPoints(
        characterData.edu,
        characterData.int
      );

    // Validate occupational skills
    const occupationalSkills = characterData.skills.filter(s => s.isOccupational);
    const baseSkillValues = this.characterCreationService.getBaseSkillValues();

    const occupationalPointsUsed = occupationalSkills.reduce((sum, skill) => {
      const baseValue = baseSkillValues[skill.name] || 0;
      const allocatedPoints = skill.value - baseValue;
      return sum + (allocatedPoints > 0 ? allocatedPoints : 0);
    }, 0);

    // Validate personal interest skills
    const personalSkills = characterData.skills.filter(s => !s.isOccupational);
    const personalPointsUsed = personalSkills.reduce((sum, skill) => {
      const baseValue = baseSkillValues[skill.name] || 0;
      const allocatedPoints = skill.value - baseValue;
      return sum + (allocatedPoints > 0 ? allocatedPoints : 0);
    }, 0);

    // Check if points exceed limits
    if (occupationalPointsUsed > occupationalPoints) {
      throw new BadRequestException(
        `超出可用職業技能點數。可用點數：${occupationalPoints}，已分配點數：${occupationalPointsUsed}`,
      );
    }

    if (personalPointsUsed > personalInterestPoints) {
      throw new BadRequestException(
        `超出可用興趣技能點數。可用點數：${personalInterestPoints}，已分配點數：${personalPointsUsed}`,
      );
    }

    // Validate individual skill values
    for (const skill of characterData.skills) {
      if (skill.value < 0 || skill.value > 99) {
        throw new BadRequestException(
          `技能值必須在 0-99 之間：${skill.name}`,
        );
      }

      const baseValue = baseSkillValues[skill.name] || 0;
      if (skill.value < baseValue) {
        throw new BadRequestException(
          `技能值不能低於基礎值。${skill.name} 的基礎值為 ${baseValue}`,
        );
      }
    }
  }

  async findAll(): Promise<Character[]> {
    return this.charactersRepository.find();
  }

  async findOne(id: number): Promise<Character> {
    return this.charactersRepository.findOneBy({ id });
  }

  async findByUser(userId: number): Promise<Character[]> {
    return this.charactersRepository.find({
      where: { user: { id: userId } },
    });
  }

  async update(
    id: number,
    characterData: Partial<Character>,
  ): Promise<Character> {
    await this.charactersRepository.update(id, characterData);
    return this.charactersRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.charactersRepository.delete(id);
  }

  private validateRequiredAttributes(data: Partial<Character>): boolean {
    const requiredAttributes = [
      'str', 'con', 'siz', 'dex', 'app', 
      'int', 'pow', 'edu', 'skills'
    ];
    return requiredAttributes.every(attr => data[attr] !== undefined);
  }
} 