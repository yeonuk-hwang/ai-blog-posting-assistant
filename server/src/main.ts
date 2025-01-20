import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  function convertToRegex(domain: string): RegExp {
    return new RegExp(`^https:\\/\\/${domain.replace('.', '\\.')}$`);
  }

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: [convertToRegex(process.env.FRONT_DOMAIN)],
    },
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
