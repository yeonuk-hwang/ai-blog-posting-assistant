import { Module } from '@nestjs/common';
import { GeminiModel, GeminiModelImplementation } from './gemini/gemini.model';
import {
  GeminiService,
  GeminiServiceImplementation,
} from './gemini/gemini.service';

@Module({
  providers: [
    {
      provide: GeminiService,
      useClass: GeminiServiceImplementation,
    },
    {
      provide: GeminiModel,
      useClass: GeminiModelImplementation,
    },
  ],
  exports: [GeminiService],
})
export class AIModule {}
