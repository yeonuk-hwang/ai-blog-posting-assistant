import { HttpService } from "./http.service";

export interface PostsService {
  generatePost(guide: string): Promise<string>;
  rewritePost(
    fullText: string,
    guide: string,
    instruction: string,
  ): Promise<string>;
}

export class PostsServiceImplementation implements PostsService {
  constructor(private readonly httpService: HttpService) {}

  async generatePost(guide: string): Promise<string> {
    const response = await this.httpService.fetch("posts/generate", {
      method: "POST",
      body: JSON.stringify({ guide }),
    });

    const responseBody = await response.json();
    return responseBody.post;
  }

  async rewritePost(
    fullText: string,
    guide: string,
    instruction: string,
  ): Promise<string> {
    const response = await this.httpService.fetch("posts/rewrite", {
      method: "POST",
      body: JSON.stringify({ guide, fullText, instruction }),
    });

    const responseBody = await response.json();
    return responseBody.post;
  }
}
