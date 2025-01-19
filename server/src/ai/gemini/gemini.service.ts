import { Content } from '@google/generative-ai';
import {
  AIService,
  GenerateTextOptions,
  Instruction,
  Message,
  Prompt,
} from '../ai.interface';
import { Inject, Injectable } from '@nestjs/common';
import { GeminiModel } from './gemini.model';

export interface GeminiService extends AIService {}

export const GeminiService = Symbol('GeminiService');

@Injectable()
export class GeminiServiceImplementation implements GeminiService {
  constructor(@Inject(GeminiModel) private readonly model: GeminiModel) {}

  async generateText(
    prompt: Prompt,
    options?: GenerateTextOptions,
  ): Promise<string> {
    const { history, instructions } = options ?? {};

    const instructionsInFormOfContent: Content[] = instructions
      ? this.generateInstructionContent(instructions)
      : [];

    const historyInFormOfContent: Content[] = history
      ? this.generateHisotryContent(history)
      : [];

    const context = instructionsInFormOfContent.concat(historyInFormOfContent);

    const question: Content = {
      role: 'user',
      parts: [
        {
          text: prompt,
        },
      ],
    };

    const result = await this.model.getModel().generateContent({
      contents: context.concat(question),
    });

    return result.response.text();
  }

  private generateInstructionContent(instructions: Instruction[]): Content[] {
    return instructions?.map((instruction: string) => ({
      role: 'user',
      parts: [
        {
          text: instruction,
        },
      ],
    }));
  }

  private generateHisotryContent(history: Message[]): Content[] {
    return history.map(({ role, message }) => {
      return {
        role,
        parts: [
          {
            text: message,
          },
        ],
      };
    });
  }
}
