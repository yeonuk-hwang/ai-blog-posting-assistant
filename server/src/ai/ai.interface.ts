export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export type Message = {
  role: Role;
  message: string;
};

export type Instruction = string;

export type Prompt = string;

export type GenerateTextOptions = {
  history?: Message[];
  instructions?: Instruction[];
};

export interface AIService {
  generateText(prompt: Prompt, options?: GenerateTextOptions): Promise<string>;
}
