import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';

interface User {
  id: string;
  username: string;
  email: string;
}

const ChatPage = () => {
  const { user } = useUser();
  const [users, setUsers] = useState<User[]>([]);

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

        if (!res.ok) throw new Error('Chyba při načítání uživatelů');

        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error('❌ Chyba při načítání uživatelů:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>QuickChat</h1>
      {user && <p>Vítej, {user.username}!</p>}

      <h2>Uživatelé:</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.username} ({u.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatPage;
