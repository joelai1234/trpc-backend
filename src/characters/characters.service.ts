import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from './entities/character.entity';

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(Character)
    private charactersRepository: Repository<Character>,
  ) {}

  async create(characterData: Partial<Character>): Promise<Character> {
    // Calculate derived attributes
    const derivedAttributes = this.calculateDerivedAttributes({
      constitution: characterData.constitution,
      size: characterData.size,
      power: characterData.power,
    });

    // Combine the original data with calculated attributes
    const character = this.charactersRepository.create({
      ...characterData,
      ...derivedAttributes,
    });

    return this.charactersRepository.save(character);
  }

  private calculateDerivedAttributes(attributes: {
    constitution: number;
    size: number;
    power: number;
  }) {
    // HP = (CON + SIZ) / 10 (rounded down)
    const maxHp = Math.floor((attributes.constitution + attributes.size) / 10);
    
    // MP = POW / 5 (rounded down)
    const maxMp = Math.floor(attributes.power / 5);
    
    // Initial Sanity = POW
    const maxSanity = attributes.power;

    return {
      hp: maxHp,
      maxHp: maxHp,
      mp: maxMp,
      maxMp: maxMp,
      sanity: maxSanity,
      maxSanity: maxSanity,
    };
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
} 