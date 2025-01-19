import { Body, Controller, Inject, Post } from '@nestjs/common';
import { GeneratePostDTO } from './dtos/generate-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    @Inject(PostsService) private readonly postsService: PostsService,
  ) {}

  @Post('/')
  async generatePost(@Body() generatePostDTO: GeneratePostDTO) {
    const post = await this.postsService.generatePost(generatePostDTO.guide);

    return {
      post,
    };
  }
}
