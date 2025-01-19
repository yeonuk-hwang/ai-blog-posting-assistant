import { HttpService } from "./http.service";

export interface PostsService {
  generatePost(guide: string): Promise<string>;
}

export class PostsServiceImplementation implements PostsService {
  constructor(private readonly httpService: HttpService) {}

  async generatePost(guide: string): Promise<string> {
    const response = await this.httpService.fetch("posts", {
      method: "POST",
      body: JSON.stringify({ guide }),
    });

    const responseBody = await response.json();
    return responseBody.post;
  }
}
