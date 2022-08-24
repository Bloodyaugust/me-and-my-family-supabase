import { createClient } from "@supabase/supabase-js";
import { createContext, useEffect, useRef, useState } from "react";

type Props = {
  children: JSX.Element,
};

type ContextValue = {
  createPost: Function,
  currentUser: User | null,
  posts: Post[],
  session: Session | null,
  signIn: Function,
  signOut: Function,
};

type Post = {
  content: string,
  created_at: string,
  id: string,
};

type Session = {
  access_token: string,
}

type User = {
  id: string,
  email?: string,
}

export const SupabaseContext = createContext<ContextValue>({
  createPost: () => { },
  currentUser: null,
  posts: [],
  session: null,
  signIn: () => {},
  signOut: () => {},
});

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL || '', process.env.REACT_APP_SUPABASE_KEY || '');

export default function SupabaseProvider({ children }: Props) {
  const mounts = useRef<number>(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  async function createPost(content: string) {
    await supabase
      .from('posts')
      .insert([{ content, user_id: currentUser?.id }])
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
      createPost,
      currentUser,
      posts,
      session,
      signIn,
      signOut,
    }}>
      {children}
    </SupabaseContext.Provider>
  )
}