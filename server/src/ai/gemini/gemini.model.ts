import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GeminiModel {
  getModel(): GenerativeModel;
}

export const GeminiModel = Symbol('GeminiModel');

@Injectable()
export class GeminiModelImplementation implements GeminiModel {
  private model: GenerativeModel;
  private MODEL = 'gemini-1.5-flash' as const;

  constructor(private readonly configService: ConfigService) {}

  getModel(): GenerativeModel {
    if (!this.model) {
      const genAI = new GoogleGenerativeAI(
        this.configService.get('GEMINI_API_KEY'),
      );

      this.model = genAI.getGenerativeModel({ model: this.MODEL });
    }

    return this.model;
  }
}
