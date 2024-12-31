import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Character } from '../characters/entities/character.entity';

@Injectable()
export class AiService {
  private openai: OpenAI;
  private readonly systemPrompt = `你是一個經驗豐富且富有創意的克蘇魯神話遊戲GM助理。你的任務是扮演助理GM，為玩家的遊戲增添深度，並在必要時提出建議。以下是你的工作重點：

1. 忠於克蘇魯神話的氛圍：
- 保持陰森、詭異和不可名狀的氛圍
- 適時融入神話元素，如不可名狀的恐懼、未知的宇宙力量等
- 創造令人不安的環境描述和NPC對話

2. 靈活創造：
- 根據劇本內容，即時生成非玩家角色（NPC）
- 提供生動的環境描述
- 設計合適的道具和事件情節

3. 即興反應：
- 對玩家的行動給予自然的回應
- 提供流暢且引人入勝的劇情推進
- 保持故事的懸疑感和驚悚氛圍
- 避免直接列舉選項或引導性提問
- 只在玩家明顯卡關較久時才提供溫和的引導

4. 輔助遊戲流程：
- 為玩家提供清晰的場景描述
- 通過環境細節暗示可能的線索
- 維持遊戲節奏的流暢性

5. 骰子系統指引：
當需要進行技能檢定時：
- 明確指出要進行檢定的玩家名稱
- 說明使用指令格式："/roll 1d100"

判定標準（僅供AI參考，不要向玩家說明）：
* 大成功：擲出 01-05
* 極限成功：擲出值 ≤ 技能值/5
* 困難成功：擲出值 ≤ 技能值/2
* 常規成功：擲出值 ≤ 技能值
* 失敗：擲出值 > 技能值
* 大失敗：擲出 96-100

在進行任何需要骰子的場景時，只需告知玩家：
1. 哪位玩家需要進行檢定
2. 使用的指令格式`;

  private messageHistory: Map<
    number,
    Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }>
  > = new Map();

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  private async getRoomHistory(roomId: number, limit: number = 10) {
    if (!this.messageHistory.has(roomId)) {
      this.messageHistory.set(roomId, []);
    }
    return this.messageHistory.get(roomId).slice(-limit);
  }

  private async addToHistory(
    roomId: number,
    message: {
      role: 'user' | 'assistant' | 'system';
      content: string;
    },
  ) {
    if (!this.messageHistory.has(roomId)) {
      this.messageHistory.set(roomId, []);
    }
    this.messageHistory.get(roomId).push(message);
  }

  async generateResponse(
    roomId: number,
    newMessages: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }>,
  ) {
    try {
      const history = await this.getRoomHistory(roomId);
      const messages = [
        { role: 'system' as const, content: this.systemPrompt },
        ...history,
        ...newMessages,
      ];
      console.log(messages);
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
      });

      const response = completion.choices[0].message.content;

      for (const msg of newMessages) {
        await this.addToHistory(roomId, msg);
      }
      await this.addToHistory(roomId, {
        role: 'assistant',
        content: response,
      });

      return response;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  async clearRoomHistory(roomId: number) {
    this.messageHistory.delete(roomId);
  }

  private formatCharacterStatus(character: Character): string {
    return `${character.name} (${character.occupation})
      HP: ${character.hp}/${character.maxHp}
      MP: ${character.mp}/${character.maxMp}
      SAN: ${character.san}/${character.maxSan}
      LUCK: ${character.luck}`;
  }
}
