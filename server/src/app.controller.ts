import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { GeminiService } from './gemini.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly geminiService: GeminiService,
  ) {}

  @Get()
  async getHello(): Promise<string> {
    const openAIResult = await this.appService.getHello();
    const geminiResult = await this.geminiService.getHello();

    const openAIPath = path.join(process.cwd(), 'openAIResult.md');
    const geminiPath = path.join(process.cwd(), 'geminiResult.md');

    await Promise.all([
      fs.writeFile(openAIPath, openAIResult),
      fs.writeFile(geminiPath, geminiResult),
    ]);

    return 'end';
  }
}
