import { createClient } from "@supabase/supabase-js";
import { createContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

type Props = {
  children: JSX.Element,
};

type Chat = {
  content: string,
  created_at: string,
  id: string,
  user_id: string,
}

type ContextValue = {
  chats: Chat[],
  createChat: Function,
  createImages: Function,
  createPost: Function,
  currentUser: User | null,
  images: { [name: string]: string },
  posts: Post[],
  session: Session | null,
  signIn: Function,
  signOut: Function,
};

type Post = {
  content: string,
  created_at: string,
  id: string,
  user_id: string,
  images?: string[],
};

type Session = {
  access_token: string,
}

type User = {
  id: string,
  email?: string,
}

export const SupabaseContext = createContext<ContextValue>({
  chats: [],
  createChat: () => { },
  createImages: () => { },
  createPost: () => { },
  currentUser: null,
  images: {},
  posts: [],
  session: null,
  signIn: () => { },
  signOut: () => { },
});

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL || '', process.env.REACT_APP_SUPABASE_KEY || '');

export default function SupabaseProvider({ children }: Props) {
  const mounts = useRef<number>(0);
  const [chats, setChats] = useState<Chat[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [imageCache, setImageCache] = useState({});
  const navigate = useNavigate();

  async function createChat(content: string) {
    await supabase
      .from('chats')
      .insert([{ content, user_id: currentUser?.id }])
  }

  async function createImages(images: FileList) {
    const newIDs: string[] = [];

    for (let i = 0; i < images.length; i++) {
      newIDs.push(uuidv4());
    }

    await supabase
      .from('images')
      .insert(newIDs.map(id => ({ id, user_id: currentUser?.id })))

    const results = await Promise.all(newIDs.map((id, i) => {
      return supabase.storage
        .from('images')
        .upload(`${id}.jpg`, images[i])
    }));

    const imageURLs = await Promise.all(results.map((image => {
      return supabase.storage
        .from('images')
        .createSignedUrl(image.data?.path || '', 60 * 60)
    })));

    console.log(imageURLs[0])
    const newImageCache: { [name: string]: string } = {};
    imageURLs.forEach((image, i) => {
      newImageCache[newIDs[i]] = image.data?.signedUrl || '';
    });

    setImageCache(previous => ({ ...previous, ...newImageCache }));

    console.log('image upload results: ', results);
    return newIDs;
  }

  async function createPost(content: string, images: FileList) {
    const ids: string[] = await createImages(images);

    await supabase
      .from('posts')
      .insert([{ content, user_id: currentUser?.id, images: ids, }])
  }

  async function fetchChats() {
    const { data: chats, error } = await supabase.from('chats').select();

    if (error) {
      console.error(error);
    }

    setChats(chats || []);

    supabase
      .channel('public:chats')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats' }, (payload: any) => {
        console.log('Change received!', payload);
        setChats((previous) => [...previous, payload.new]);
      })
      .subscribe((e: any, e2: any) => console.log('Subscribed!', e, e2))
  }

  async function fetchPosts() {
    const { data: posts, error } = await supabase.from('posts').select();

    if (error) {
      console.error(error);
    }

    setPosts(posts || []);

    supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload: any) => {
        console.log('Change received!', payload);
        setPosts((previous) => [...previous, payload.new]);
      })
      .subscribe((e: any, e2: any) => console.log('Subscribed!', e, e2))
  }

  async function fetchSession() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error(error);
    }

    console.log('setting session: ', session);
    setSession(session);

    if (!session) {
      navigate('/login');
    }
  }

  async function fetchUser() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error(error);
    }

    setCurrentUser(user);
  }

  async function signIn(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (error) {
      console.error(error);
      setCurrentUser(null);
      setSession(null);
    }

    console.log(data);
    setCurrentUser(data.user);
    setSession(data.session);
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error(error);
    }

    setCurrentUser(null);
    setSession(null);
    setPosts([]);
    setChats([]);
  }

  useEffect(() => {
    console.log(`useEffect on mount: ${mounts.current}`);

    if (mounts.current === 0) {

      fetchSession();
    }

    if (mounts.current > 1) {
      if (!session) {
        console.log('fetching session from useEffect')
        fetchSession();
      } else {
        console.log('fetching user from useEffect')
        fetchUser();
        fetchPosts();
        fetchChats();
      }
    }

    mounts.current += 1;

    return () => {
      if (mounts.current > 2) {
        console.log('unsubbing from channels');
        supabase.removeAllChannels();
      }
    }
  }, [mounts, session])

  return (
    <SupabaseContext.Provider value={{
      chats,
      createChat,
      createImages,
      createPost,
      currentUser,
      images: imageCache,
      posts,
      session,
      signIn,
      signOut,
    }}>
      {children}
    </SupabaseContext.Provider>
  )
}
