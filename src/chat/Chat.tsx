import { useContext, useRef } from 'react';
import { SupabaseContext } from '../SupabaseContext';
import styles from './Chat.module.css';

export default function Chat() {
  const { chats, createChat } = useContext(SupabaseContext);
  const chatRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.root}>
      <h3>Chat</h3>
      <div className={styles.chats}>
        {chats.map(chat => (
          <div className={styles.chat} key={chat.id}>
            <span>{chat.user_id} - {chat.content}</span>
            <hr />
          </div>
        ))}
      </div>
      <input type="text" name="chat" ref={chatRef} />
      <button onClick={() => {
        if (chatRef.current) {
          createChat(chatRef.current.value);
          chatRef.current.value = '';
        }
      }}>Send Chat</button>
    </div>
  )
}
