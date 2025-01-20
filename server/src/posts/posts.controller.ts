import { Body, Controller, Inject, Post } from '@nestjs/common';
import { GeneratePostDTO } from './dtos/generate-post.dto';
import { PostsService } from './posts.service';
import { RewritePostDTO } from './dtos/rewrite-post.dto';

@Controller('posts')
export class PostsController {
  constructor(
    @Inject(PostsService) private readonly postsService: PostsService,
  ) {
    // NOTE: temporary
    console.log('init post controller');
  }

  @Post('/generate')
  async generatePost(@Body() generatePostDTO: GeneratePostDTO) {
    const post = await this.postsService.generatePost(generatePostDTO.guide);

    return {
      post,
    };
  }

  @Post('/rewrite')
  async rewritePost(@Body() rewritePostDTO: RewritePostDTO) {
    const { instruction, fullText, guide } = rewritePostDTO;

    const post = await this.postsService.rewritePost(
      fullText,
      guide,
      instruction,
    );
    return {
      post,
    };
  }
}
