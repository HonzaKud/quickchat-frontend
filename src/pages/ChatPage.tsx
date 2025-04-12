import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';

interface User {
  id: string;
  username: string;
  email: string;
}

interface Message {
  _id: string;
  sender: User;
  recipient: User;
  content: string;
  timestamp: string;
}

const ChatPage = () => {
  const { user } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:5000/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setUsers(data.filter((u: User) => u.id !== user?.id)); // neukazuj sebe
      } catch (error) {
        console.error('Chyba při načítání uživatelů:', error);
      }
    };

    fetchUsers();
  }, [user]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:5000/api/messages', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        // Filtrovat jen zprávy mezi tebou a vybraným uživatelem
        const filtered = data.filter((msg: Message) =>
          (msg.sender.id === user?.id && msg.recipient.id === selectedUser.id) ||
          (msg.sender.id === selectedUser.id && msg.recipient.id === user?.id)
        );

        setMessages(filtered);
      } catch (error) {
        console.error('Chyba při načítání zpráv:', error);
      }
    };

    fetchMessages();
  }, [selectedUser, user]);

  return (
    <div style={{ display: 'flex', padding: '2rem' }}>
      {/* Levý panel – kontakty */}
      <div style={{ width: '250px', borderRight: '1px solid #ccc', paddingRight: '1rem' }}>
        <h3>Uživatelé</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {users.map((u) => (
            <li
              key={u.id}
              onClick={() => setSelectedUser(u)}
              style={{
                cursor: 'pointer',
                padding: '0.5rem',
                backgroundColor: selectedUser?.id === u.id ? '#f0f0f0' : 'transparent',
              }}
            >
              {u.username}
            </li>
          ))}
        </ul>
      </div>

      {/* Pravý panel – zprávy */}
      <div style={{ flex: 1, paddingLeft: '2rem' }}>
        {selectedUser ? (
          <>
            <h3>Chat s {selectedUser.username}</h3>
            <div style={{ border: '1px solid #ddd', padding: '1rem', height: '400px', overflowY: 'auto' }}>
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  style={{
                    textAlign: msg.sender.id === user?.id ? 'right' : 'left',
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      backgroundColor: msg.sender.id === user?.id ? '#dcf8c6' : '#eee',
                      padding: '0.5rem 1rem',
                      borderRadius: '10px',
                      maxWidth: '70%',
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>Vyber uživatele, se kterým chceš chatovat.</p>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
