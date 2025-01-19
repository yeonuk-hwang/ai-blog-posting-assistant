import { useState } from "react";
import { HttpServiceImplementation } from "./services/http.service";
import { PostsServiceImplementation } from "./services/posts.service";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const httpService = new HttpServiceImplementation("http://localhost:3000/");
const postsService = new PostsServiceImplementation(httpService);

function App() {
  const [guide, setGuide] = useState("");
  const [post, setPost] = useState("");

  async function generatePost() {
    const post = await postsService.generatePost(guide);
    setPost(post);
  }

  return (
    <div className="flex w-screen h-screen">
      <section className="prose border flex-1 max-w-full p-6">
        {post ? (
          <Markdown remarkPlugins={[remarkBreaks]}>{post}</Markdown>
        ) : (
          <p className="text-gray-500">Please generate a post</p>
        )}
      </section>
      <section className="w-1/3 max-w-md p-6">
        <Textarea
          placeholder="블로그 포스팅 가이드를 입력하세요"
          className="h-1/3"
          onChange={(e) => setGuide(e.target.value)}
          value={guide}
        />
        <section className="mt-4">
          <Button onClick={generatePost}>블로그 포스팅 생성</Button>
        </section>
      </section>
    </div>
  );
}

export default App;
