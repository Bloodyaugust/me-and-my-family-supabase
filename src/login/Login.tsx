import { useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SupabaseContext } from '../SupabaseContext';

export default function Login() {
  const { currentUser, signIn } = useContext(SupabaseContext);
  const emailRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  return (
    <div>
      <h1>Login</h1>
      <input placeholder="email address" type="text" name="email" ref={emailRef} />
      <button onClick={() => signIn(emailRef?.current?.value)}>Login</button>
    </div>
  )
}