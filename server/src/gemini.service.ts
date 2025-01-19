import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EXAMPLES } from './examples';

@Injectable()
export class GeminiService {
  genAI: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    this.genAI = new GoogleGenerativeAI(
      this.configService.get('GEMINI_API_KEY'),
    );
  }

  async getHello(): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const developerPrompt = {
      role: 'developer',
      content: [
        {
          type: 'text',
          text: '너는 네이버 블로그 포스팅 전문가야, 가이드가 주어지면 그 가이드에 맞춰서 블로그 포스팅을 작성해',
        },
        {
          type: 'text',
          text: '그리고 말투는 ~~입니다처럼 정중한 말투가 아니라, ~요, ~답니다 등의 발랄하고 가벼운 말투를 사용해.',
        },
        { type: 'text', text: '1500자 이상으로 작성해' },
        {
          type: 'text',
          text: '유저가 태그 키워드를 주면 그 태그를 포함해서 연관키워드를 20개 이상 만들어서 제일 마지막에 추가해줘',
        },
      ],
    };

    const instruction = developerPrompt.content.map(({ text }) => {
      return {
        role: 'user',
        parts: [{ text }],
      };
    });

    const history: { role: string; parts: { text: string }[] }[] = EXAMPLES.map(
      ({ guide, answer }) => {
        return [
          {
            role: 'user',
            parts: [
              {
                text: guide,
              },
            ],
          },
          {
            role: 'model',
            parts: [
              {
                text: answer,
              },
            ],
          },
        ];
      },
    ).flat();

    const prompt = `2. 제품의 장점 언급 (작은 타블렛, 간편한 휴대, 특허받은 유산균, 현직치과원장, 서울대 치의학박사)
충치, 잇몸질환 문제
입냄새가 고민일때
양치후에도 남이있는 찝찝함
구강영양제를 찾고 계신 분
특허유산균 1000억 CFU
17종 유산균, 시너지업 부원료

1000자 이상 포스팅 준수
이지비오랄,구강유산균, 잇몸유산균 각각 5회이상 본문 언급


이지비오랄,구강유산군,잇몸유산균,잇몸건강,입냄새제거,피나는 잇몸
`;

    console.log(JSON.stringify(instruction.concat(history), null, 2));

    const chat = model.startChat({
      history: instruction.concat(history),
    });

    const result = await chat.sendMessage(prompt);
    return result.response.text();
  }
}
