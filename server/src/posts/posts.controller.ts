import { Body, Controller, Inject, Post } from '@nestjs/common';
import { GeneratePostDTO } from './dtos/generate-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(
    @Inject(PostsService) private readonly postsService: PostsService,
  ) {}

  @Post('/')
  generatePost(@Body() generatePostDTO: GeneratePostDTO) {
    return this.postsService.generatePost(generatePostDTO.guide);
  }
}
