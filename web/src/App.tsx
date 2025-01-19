import { useState } from "react";
import { HttpServiceImplementation } from "./services/http.service";
import { PostsServiceImplementation } from "./services/posts.service";

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
    <>
      <div>{post}</div>
      <input onChange={(e) => setGuide(e.target.value)} value={guide} />
      <button onClick={generatePost}>generate post</button>
    </>
  );
}

export default App;
