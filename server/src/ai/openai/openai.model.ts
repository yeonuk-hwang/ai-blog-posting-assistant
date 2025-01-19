import OpenAI from 'openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface OpenAIModel {
  getModel(): OpenAI;
}

export const OpenAIModel = Symbol('OpenAIModel');

@Injectable()
export class OpenAIModelImplentation implements OpenAIModel {
  private model: OpenAI;

  constructor(private readonly configService: ConfigService) {}

  getModel(): OpenAI {
    if (!this.model) {
      this.model = new OpenAI({
        apiKey: this.configService.get('OPENAI_API_KEY'),
      });
    }

    return this.model;
  }
}
