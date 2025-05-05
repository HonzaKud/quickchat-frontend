import { useEffect, useRef, useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

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
  const { user, setUser, loading } = useUser();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const socket = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.REACT_APP_API_URL;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('selectedUser');
    setUser(null);
    navigate('/login');
  };

  // 🔌 Socket připojení
  useEffect(() => {
    if (!user || !API_URL || socket.current) return;

    socket.current = io(API_URL);
    socket.current.emit('join', user.id);

    socket.current.on('newMessage', (msg: Message) => {
      const isForMe = msg.sender._id === user.id || msg.recipient._id === user.id;
      const isCurrentChat =
        msg.sender._id === selectedUser?._id ||
        msg.recipient._id === selectedUser?._id;

      if (isForMe && isCurrentChat) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.current?.disconnect();
    };
  }, [user, selectedUser, API_URL]);

  // 👥 Načtení uživatelů
  useEffect(() => {
    if (!user || !API_URL) return;

    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data: User[] = await res.json();

        const filteredUsers = data
          .filter((u: User) => u._id !== user.id)
          .map((u: User) => ({ ...u, id: u._id }));

        setUsers(filteredUsers);

        const saved = localStorage.getItem('selectedUser');
        if (saved) {
          const parsed = JSON.parse(saved);
          const match = filteredUsers.find((u) => u.id === parsed.id);
          if (match) {
            setSelectedUser(match);
          } else {
            setSelectedUser(null);
          }
        }
      } catch (error) {
        console.error('❌ Chyba při načítání uživatelů:', error);
      }
    };

    fetchUsers();
  }, [user, API_URL]);

  // 📩 Načtení zpráv
  useEffect(() => {
    if (!selectedUser || !user || !API_URL) return;

    localStorage.setItem('selectedUser', JSON.stringify(selectedUser));

    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        const filtered = data
          .filter(
            (msg: Message) =>
              (msg.sender._id === user.id && msg.recipient._id === selectedUser.id) ||
              (msg.sender._id === selectedUser.id && msg.recipient._id === user.id)
          )
          .sort(
            (a: Message, b: Message) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

        setMessages(filtered);
      } catch (error) {
        console.error('Chyba při načítání zpráv:', error);
      }
    };

    fetchMessages();
  }, [selectedUser, user, API_URL]);

  // 🔽 Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✉️ Odeslání zprávy
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !API_URL) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/messages`, {
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
        socket.current?.emit('sendMessage', data);
        setNewMessage('');
      } else {
        console.error('Chyba při odesílání:', data.message);
      }
    } catch (err) {
      console.error('Chyba při spojení:', err);
    }
  };

  // ⏳ Loading
  if (loading) {
    return <div className="p-6 text-gray-500">Načítání uživatele...</div>;
  }

  // ⛔ Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Odhlásit se
        </button>
      </div>

      <div className="flex bg-white shadow-md rounded-xl overflow-hidden min-h-[500px]">
        {/* Uživatelé */}
        <div className="w-64 border-r p-4 bg-gray-100">
          <h3 className="text-lg font-semibold mb-4">Uživatelé</h3>
          <ul className="space-y-2">
            {users.map((u) => (
              <li
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`cursor-pointer p-2 rounded ${
                  selectedUser?.id === u.id ? 'bg-blue-100' : 'hover:bg-gray-200'
                }`}
              >
                {u.username}
              </li>
            ))}
          </ul>
        </div>

        {/* Chat */}
        <div className="flex-1 p-6 flex flex-col">
          {selectedUser ? (
            <>
              <h3 className="text-lg font-bold mb-4">
                Chat s {selectedUser.username}
              </h3>
              <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${
                      msg.sender._id === user.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`rounded-xl px-4 py-2 max-w-[70%] ${
                        msg.sender._id === user.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Napiš zprávu..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Odeslat
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-600">
              Vyber uživatele, se kterým chceš chatovat.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
