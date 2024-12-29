import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

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
- 對玩家的行動給予合理的回應
- 提供自然且引人入勝的劇情推進
- 保持故事的懸疑感和驚悚氛圍

4. 輔助遊戲流程：
- 為玩家提供清晰的場景描述
- 在適當時機提供線索和提示
- 維持遊戲節奏的流暢性

請記住：你的回應應該簡潔、富有氣氛，並且始終保持克蘇魯神話的恐怖元素。`;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateResponse(
    roomId: number,
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  ) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        // model: 'gpt-4o-mini-2024-07-18',
        messages: [{ role: 'system', content: this.systemPrompt }, ...messages],
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }
}
