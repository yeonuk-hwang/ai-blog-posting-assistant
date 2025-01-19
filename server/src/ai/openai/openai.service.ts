import {
  AIService,
  GenerateTextOptions,
  Instruction,
  Message,
  Prompt,
  Role,
} from '../ai.interface';
import { Inject, Injectable } from '@nestjs/common';
import { OpenAIModel } from './openai.model';
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionDeveloperMessageParam,
  ChatCompletionMessageParam,
  ChatCompletionUserMessageParam,
} from 'openai/resources';

@Injectable()
export class OpenAIService implements AIService {
  constructor(@Inject(OpenAIModel) private readonly model: OpenAIModel) {}

  async generateText(
    prompt: Prompt,
    options?: GenerateTextOptions,
  ): Promise<string> {
    const { history, instructions } = options ?? {};

    const developerPrompts: ChatCompletionDeveloperMessageParam[] = instructions
      ? this.generateDeveloperInstruction(instructions)
      : [];

    const historyMessages: ChatCompletionMessageParam[] = history
      ? this.generateHistory(history)
      : [];

    const context: ChatCompletionMessageParam[] = [
      ...developerPrompts,
      ...historyMessages,
    ];

    const question: ChatCompletionUserMessageParam = {
      role: 'user',
      content: prompt,
    };

    const completion = await this.model.getModel().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [...context, question],
    });

    return completion.choices[0].message.content.trim();
  }

  private generateDeveloperInstruction(
    instructions: Instruction[],
  ): ChatCompletionDeveloperMessageParam[] {
    return instructions.map((instruction: string) => ({
      role: 'developer',
      content: instruction,
    }));
  }

  private generateHistory(
    history: Message[],
  ): (ChatCompletionUserMessageParam | ChatCompletionAssistantMessageParam)[] {
    return history.map(({ role, message }) => {
      return {
        role: this.convertMessageRole(role),
        content: message,
      };
    });
  }

  private convertMessageRole(role: Role) {
    switch (role) {
      case Role.USER:
        return 'user';
      case Role.MODEL:
        return 'assistant';
      default:
        throw new Error('Invalid role');
    }
  }
}
