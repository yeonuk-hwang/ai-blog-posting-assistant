import { AIService, Instruction, Message, Role } from '@/ai/ai.interface';
import { mock } from 'jest-mock-extended';
import { GenerativeModel } from '@google/generative-ai';
import { GeminiServiceImplementation } from './gemini.service';

test('it should be able to call api with prompts, examples, and instruction', async () => {
  const model = mock<GenerativeModel>();

  model.generateContent.mockReturnValue(
    Promise.resolve({
      response: {
        text: jest.fn().mockReturnValue('Hello, World'),
        functionCall: () => undefined,
        functionCalls: () => undefined,
      },
    }),
  );
  const geminiModel = {
    getModel: () => model,
  };

  const geminiService: AIService = new GeminiServiceImplementation(geminiModel);

  const history: Message[] = [
    { role: Role.USER, message: '블로그 포스팅을 작성해줘' },
    { role: Role.MODEL, message: '네, 알겠습니다. 어떤 주제로 작성해드릴까요' },
    { role: Role.USER, message: '인테리어' },
    { role: Role.MODEL, message: '오늘은 인테리어에 대해 알아보겠습니다...' },
  ];

  const instructions: Instruction[] = [
    '너는 네이버 블로그 포스팅 전문가야, 가이드가 주어지면 그 가이드에 맞춰서 블로그 포스팅을 작성해',
    '그리고 말투는 ~~입니다처럼 정중한 말투가 아니라, ~요, ~답니다 등의 발랄하고 가벼운 말투를 사용해.',
    '1500자 이상으로 작성해',
  ];

  await geminiService.generateText(prompt, {
    history,
    instructions,
  });

  expect(model.generateContent).toBeCalledWith({
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: '너는 네이버 블로그 포스팅 전문가야, 가이드가 주어지면 그 가이드에 맞춰서 블로그 포스팅을 작성해',
          },
        ],
      },
      {
        role: 'user',
        parts: [
          {
            text: '그리고 말투는 ~~입니다처럼 정중한 말투가 아니라, ~요, ~답니다 등의 발랄하고 가벼운 말투를 사용해.',
          },
        ],
      },
      {
        role: 'user',
        parts: [
          {
            text: '1500자 이상으로 작성해',
          },
        ],
      },
      {
        role: 'user',
        parts: [
          {
            text: '블로그 포스팅을 작성해줘',
          },
        ],
      },
      {
        role: 'model',
        parts: [
          {
            text: '네, 알겠습니다. 어떤 주제로 작성해드릴까요',
          },
        ],
      },
      {
        role: 'user',
        parts: [
          {
            text: '인테리어',
          },
        ],
      },
      {
        role: 'model',
        parts: [
          {
            text: '오늘은 인테리어에 대해 알아보겠습니다...',
          },
        ],
      },
      {
        role: 'user',
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  });
});

const prompt = `
    2. 제품의 장점 언급 (작은 타블렛, 간편한 휴대, 특허받은 유산균, 현직치과원장, 서울대 치의학박사)

    충치, 잇몸질환 문제
    입냄새가 고민일때
    양치후에도 남이있는 찝찝함
    구강영양제를 찾고 계신 분
    특허유산균 1000억 CFU
    17종 유산균, 시너지업 부원료

    1000자 이상 포스팅 준수
    이지비오랄,구강유산균, 잇몸유산균 각각 5회이상 본문 언급
`;
