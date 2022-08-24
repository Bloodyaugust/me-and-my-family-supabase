import { useCallback, useContext, useMemo, useRef } from 'react';
import { SupabaseContext } from '../SupabaseContext';
import styles from './Feed.module.css';

export default function Feed() {
  const { createPost, images, posts } = useContext(SupabaseContext);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const sortedPosts = useMemo(() => {
    return posts.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [posts]);

  const onPost = useCallback(async () => {
    if (contentRef.current && imageRef.current) {
      const postContent: string = contentRef.current.value || '';
      const files: FileList = imageRef.current.files || new FileList();

      await createPost(postContent, files);
      contentRef.current.value = '';
      imageRef.current.value = '';
    }
  }, [contentRef, createPost]);

  return (
    <div className={styles.root}>
      <div className={styles.newPostContainer}>
        <h3>Create Post</h3>
        <textarea className={styles.newPost} rows={5} name="content" ref={contentRef} onKeyDown={e => {
          if (!e.shiftKey && e.key === 'Enter') {
            e.preventDefault();
            onPost();
          }
        }} />
        <div className={styles.postActions}>
          <label htmlFor="new-post-images">Add images</label>
          <input accept="image/*" id="new-post-images" type="file" name="images" multiple ref={imageRef} />
          <button className={styles.postButton} onClick={onPost}>Post</button>
        </div>
      </div>
      <hr className={styles.hr} />
      <div className={styles.posts}>
        {sortedPosts.map(post => (
          <div key={post.id} className={styles.post}>
            <span>{post.user_id} - {post.created_at}</span>
            <hr className={styles.hr} />
            <span>{post.content}</span>
            <div className={styles.images}>
              {post.images?.map((image) => (
                <img alt="From post" className={styles.image} key={image} src={`${images[image]}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
