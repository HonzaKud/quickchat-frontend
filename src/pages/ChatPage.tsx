import { useUser } from '../context/UserContext';

const ChatPage = () => {
  const { user } = useUser();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Chat Page</h1>
      {user ? (
        <p>Vítej, {user.username}!</p>
      ) : (
        <p>Načítám údaje o uživateli...</p>
      )}
    </div>
  );
};

export default ChatPage;
