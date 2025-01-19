import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: [/localhost:\d/],
    },
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
