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
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    if (user && API_URL && !socket.current) {
      socket.current = io(API_URL);
      socket.current.emit('join', user.id);

      socket.current.on('newMessage', (msg: Message) => {
        if (
          msg.sender._id === selectedUser?._id ||
          msg.recipient._id === selectedUser?._id
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      });
    }

    return () => {
      socket.current?.disconnect();
    };
  }, [user, selectedUser, API_URL]);

  useEffect(() => {
    if (loading || !user || !API_URL) return;

    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        const withId = data
          .filter((u: any) => u._id !== user?.id)
          .map((u: any) => ({ ...u, id: u._id }));

        setUsers(withId);
      } catch (error) {
        console.error('❌ Chyba při načítání uživatelů:', error);
      }
    };

    fetchUsers();
  }, [user, API_URL, loading]);

  useEffect(() => {
    if (loading || !selectedUser || !user || !API_URL) return;

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
              (msg.sender._id === user?.id && msg.recipient._id === selectedUser.id) ||
              (msg.sender._id === selectedUser.id && msg.recipient._id === user?.id)
          )
          .sort((a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        setMessages(filtered);
      } catch (error) {
        console.error('Chyba při načítání zpráv:', error);
      }
    };

    fetchMessages();
  }, [selectedUser, user, API_URL, loading]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-purple-100 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto shadow-xl rounded-3xl overflow-hidden backdrop-blur-md bg-white/60 border border-slate-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-300 bg-white/40">
          <h1 className="text-2xl font-bold text-slate-800">💬 QuickChat</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Odhlásit se
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Uživatelé */}
          <div className="w-64 border-r border-slate-300 bg-white/50 p-4">
            <h3 className="text-lg font-semibold mb-4 text-slate-700">Uživatelé</h3>
            <ul className="space-y-2">
              {users.map((u) => (
                <li
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`cursor-pointer p-2 rounded transition text-slate-800 font-medium ${
                    selectedUser?.id === u.id ? 'bg-gradient-to-r from-indigo-400 to-purple-400 text-white shadow-md' : 'hover:bg-indigo-100'
                  }`}
                >
                  👤 {u.username}
                </li>
              ))}
            </ul>
          </div>

          {/* Chat */}
          <div className="flex-1 p-6 flex flex-col bg-white/30">
            {selectedUser ? (
              <>
                <h3 className="text-xl font-bold mb-4 text-slate-800">Chat s {selectedUser.username}</h3>
                <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${
                        msg.sender._id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-2 max-w-[70%] shadow ${
                          msg.sender._id === user?.id
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                            : 'bg-white text-slate-800 border border-slate-300'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Napiš zprávu..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow"
                  >
                    Odeslat
                  </button>
                </div>
              </>
            ) : (
              <p className="text-slate-600">Vyber uživatele, se kterým chceš chatovat.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
