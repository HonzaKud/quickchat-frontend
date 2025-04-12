import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
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
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    if (!user) {
      console.log('❗ Uživatelský kontext ještě není načten.');
      return;
    }

    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❗ Token není dostupný.');
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log('✅ Načtení uživatelé:', data);
        console.log('🔍 Přihlášený user:', user);

        const withId = data.map((u: any) => ({
          ...u,
          id: u._id,
        }));

        setUsers(withId);
      } catch (error) {
        console.error('❌ Chyba při načítání uživatelů:', error);
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: selectedUser.id,
          content: newMessage,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [...prev, data]);
        setNewMessage('');
      } else {
        console.error('Chyba při odesílání:', data.message);
      }
    } catch (err) {
      console.error('Chyba při spojení:', err);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>
          Odhlásit se
        </button>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Kontakty */}
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

        {/* Chat panel */}
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

              <div style={{ marginTop: '1rem' }}>
                <input
                  type="text"
                  placeholder="Napiš zprávu..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{ width: '80%', padding: '0.5rem' }}
                />
                <button onClick={sendMessage} style={{ padding: '0.5rem 1rem', marginLeft: '0.5rem' }}>
                  Odeslat
                </button>
              </div>
            </>
          ) : (
            <p>Vyber uživatele, se kterým chceš chatovat.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
