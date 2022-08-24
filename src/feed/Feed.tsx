import { useCallback, useContext, useMemo, useRef } from "react";
import { SupabaseContext } from "../SupabaseContext";

export default function Feed() {
  const { createPost, currentUser, posts, signIn, signOut } = useContext(SupabaseContext);
  const contentRef = useRef<HTMLInputElement>(null);
  const sortedPosts = useMemo(() => {
    return posts.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [posts]);

  const onPost = useCallback(async () => {
    const postContent: string = contentRef.current?.value || '';

    await createPost(postContent);
  }, [contentRef, createPost]);

  return (
    <div>
      <h2>Feed</h2>
      <span>{currentUser?.id} - {currentUser?.email}</span>
      <div>
        {currentUser &&
          <button onClick={() => signOut()}>Sign Out</button>
        }
      </div>
      <div>
        <h3>Create Post</h3>
        <input type="text" name="content" ref={contentRef} />
        <button onClick={onPost}>Post</button>
      </div>
      {sortedPosts.map(post => (
        <div key={post.id}>
          <span>{post.content}</span>
        </div>
      ))}
    </div>
  )
}
