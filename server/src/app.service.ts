import OpenAI from 'openai';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execSync } from 'child_process';
import { EXAMPLES } from './examples';
import { ChatCompletionMessageParam } from 'openai/resources';

@Injectable()
export class AppService {
  openAI: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const openAIKey = execSync(
      'op read op://shared/OpenAI/credential --no-newline',
      { encoding: 'utf8' },
    ).trim();

    this.openAI = new OpenAI({
      apiKey: openAIKey,
    });
  }

  async getHello(): Promise<string> {
    const developerPrompt: ChatCompletionMessageParam = {
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

    const examplePropmt: ChatCompletionMessageParam[][] = EXAMPLES.map(
      ({ guide, answer }) => {
        return [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: guide,
              },
            ],
          },
          {
            role: 'assistant',
            content: [
              {
                type: 'text',
                text: answer,
              },
            ],
          },
        ];
      },
    );

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

    const completion = await this.openAI.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        developerPrompt,
        ...examplePropmt.flat(),
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    console.log(JSON.stringify(completion, null, 2));

    console.log(completion.choices[0].message);

    return completion.choices[0].message.content;
  }
}
