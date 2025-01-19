import { Module } from '@nestjs/common';
import { AIService } from './ai.interface';
import { OpenAIService } from './openai/openai.service';
import { OpenAIModel, OpenAIModelImplentation } from './openai/openai.model';

@Module({
  providers: [
    {
      provide: AIService,
      useClass: OpenAIService,
    },
    {
      provide: OpenAIModel,
      useClass: OpenAIModelImplentation,
    },
  ],
  exports: [AIService],
})
export class AIModule {}
