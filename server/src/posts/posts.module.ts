import { AIModule } from '@/ai/ai.module';
import { Module } from '@nestjs/common';
import { PostsService, PostsServiceImplementation } from './posts.service';
import { PostsController } from './posts.controller';

@Module({
  imports: [AIModule],
  controllers: [PostsController],
  providers: [
    {
      provide: PostsService,
      useClass: PostsServiceImplementation,
    },
  ],
})
export class PostsModule {}
