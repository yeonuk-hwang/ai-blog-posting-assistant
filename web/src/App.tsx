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
  // TODO: extract it to custom hook
  const [post, setPost] = useState("");
  const [postLoading, setPostLoading] = useState(false);

  async function generatePost() {
    try {
      setPostLoading(true);
      const post = await postsService.generatePost(guide);
      setPost(post);
    } finally {
      setPostLoading(false);
    }
  }

  async function rewritePost(instruction: string) {
    try {
      setPostLoading(true);
      const newPost = await postsService.rewritePost(post, guide, instruction);
      setPost(newPost);
    } finally {
      setPostLoading(false);
    }
  }

  function handleSubmit(
    event: React.FormEvent<
      HTMLFormElement & {
        elements: { rewriteInstruction: HTMLTextAreaElement };
      }
    >,
  ) {
    event.preventDefault();
    rewritePost(event.currentTarget.elements.rewriteInstruction.value);
  }

  return (
    <div className="flex w-screen min-h-screen">
      <section className="prose border flex-1 max-w-full p-6">
        {post ? (
          <Markdown remarkPlugins={[remarkBreaks]} skipHtml={true}>
            {post}
          </Markdown>
        ) : (
          <p className="text-gray-500">포스팅을 생성해 주세요</p>
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
          <Button
            onClick={generatePost}
            disabled={postLoading}
            className={`relative ${
              postLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
            }`}
          >
            {postLoading ? (
              <span className="invisible">블로그 포스팅 생성</span>
            ) : (
              "블로그 포스팅 생성"
            )}
            {postLoading && (
              <span className="absolute left-0 right-0">생성 중...</span>
            )}
          </Button>
        </section>
        {post ? (
          <form className="mt-8" onSubmit={handleSubmit}>
            <Textarea
              name="rewriteInstruction"
              className="h-24"
              placeholder="재작성 지시사항을 입력하세요."
            />
            <Button
              disabled={postLoading}
              className={`relative mt-4 ${
                postLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
              }`}
            >
              {postLoading ? (
                <span className="invisible">재작성 하기</span>
              ) : (
                "재작성 하기"
              )}
              {postLoading && (
                <span className="absolute left-0 right-0">생성 중...</span>
              )}
            </Button>
          </form>
        ) : null}
      </section>
    </div>
  );
}

export default App;
