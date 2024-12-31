import { Injectable } from '@nestjs/common';

@Injectable()
export class CharacterCreationService {
  // Validate core characteristics based on COC 7E rules
  validateCoreCharacteristics(characteristics: {
    str: number;
    con: number;
    siz: number;
    dex: number;
    app: number;
    int: number;
    pow: number;
    edu: number;
  }) {
    // 3D6×5 characteristics (15-90)
    const threeDiceSixStats = ['str', 'con', 'dex', 'app', 'pow'];
    for (const stat of threeDiceSixStats) {
      if (characteristics[stat] < 15 || characteristics[stat] > 90) {
        throw new Error(`${stat.toUpperCase()} must be between 15 and 90 (3D6×5)`);
      }
    }

    // (2D6+6)×5 characteristics (40-90)
    const twoDiceSixPlusSixStats = ['siz', 'int', 'edu'];
    for (const stat of twoDiceSixPlusSixStats) {
      if (characteristics[stat] < 40 || characteristics[stat] > 90) {
        throw new Error(`${stat.toUpperCase()} must be between 40 and 90 ((2D6+6)×5)`);
      }
    }
  }

  // Calculate derived attributes
  calculateDerivedAttributes(characteristics: {
    con: number;
    siz: number;
    pow: number;
    str: number;
    dex: number;
  }) {
    // HP = (CON + SIZ) / 10 (rounded up)
    const maxHp = Math.ceil((characteristics.con + characteristics.siz) / 10);
    
    // MP = POW / 10 (rounded up)
    const maxMp = Math.ceil(characteristics.pow / 10);
    
    // Initial Sanity = POW
    const maxSan = characteristics.pow;

    // Calculate MOV based on STR, DEX, and SIZ comparison
    let mov = 8; // default
    if (
      characteristics.str > characteristics.siz &&
      characteristics.dex > characteristics.siz
    ) {
      mov = 9;
    } else if (
      characteristics.str < characteristics.siz &&
      characteristics.dex < characteristics.siz
    ) {
      mov = 7;
    }

    return {
      hp: maxHp,
      maxHp,
      mp: maxMp,
      maxMp,
      san: maxSan,
      maxSan,
      mov,
    };
  }

  // Calculate available skill points
  calculateSkillPoints(edu: number, int: number) {
    return {
      occupationalPoints: edu * 4,
      personalInterestPoints: int * 2,
    };
  }

  // Get base skill values according to COC 7E
  getBaseSkillValues(): Record<string, number> {
    return {
      // Combat Skills
      閃避: 25,
      鬥毆: 25,
      投擲: 20,

      // Communication Skills
      母語: 20,
      說服: 10,
      心理學: 10,
      魅惑: 15,
      恐嚇: 15,

      // Investigation Skills
      偵查: 25,
      聆聽: 20,
      圖書館使用: 20,
      追蹤: 10,
      法律: 5,
      會計: 5,

      // Physical Skills
      攀爬: 20,
      跳躍: 20,
      游泳: 20,
      潛行: 20,
      
      // Academic Skills
      醫學: 1,
      歷史: 5,
      科學: 1,
      神秘學: 5,
    };
  }
} 