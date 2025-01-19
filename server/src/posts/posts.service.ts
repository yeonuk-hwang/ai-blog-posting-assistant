import { AIService, Instruction, Message, Role } from '@/ai/ai.interface';
import { GeminiService } from '@/ai/gemini/gemini.service';
import { EXAMPLES } from '@/contexts/blog-posting';
import { Inject } from '@nestjs/common';

export interface PostsService {
  generatePost(guide: string): Promise<string>;
}

export const PostsService = Symbol('PostsService');

export class PostsServiceImplementation implements PostsService {
  constructor(@Inject(AIService) private readonly aiService: AIService) {}

  generatePost(guide: string): Promise<string> {
    const instructions: Instruction[] = [
      '너는 네이버 블로그 포스팅 전문가야, 가이드가 주어지면 그 가이드에 맞춰서 블로그 포스팅을 작성해',
      '그리고 말투는 ~~입니다처럼 정중한 말투가 아니라, ~요, ~답니다 등의 발랄하고 가벼운 말투를 사용해.',
      '1500자 이상으로 작성해',
    ];

    const examples: Message[] = this.examples;

    return this.aiService.generateText(guide, {
      instructions,
      history: examples,
    });
  }

  private get examples(): Message[] {
    return EXAMPLES.map(({ guide, answer }) => {
      return [
        {
          role: Role.USER,
          message: guide,
        },
        {
          role: Role.MODEL,
          message: answer,
        },
      ];
    }).flat();
  }
}
