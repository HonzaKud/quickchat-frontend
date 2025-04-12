import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser(); // 🔄 musí být voláno hned nahoře!

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');

  // 🔐 Přesměrování až po hookách
  if (user) {
    return <Navigate to="/chat" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Přihlášení selhalo');
      } else {
        localStorage.setItem('token', data.token);
        setUser(data.user); // ✅ nastavíme do kontextu
        navigate('/chat');
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ Chyba serveru.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Přihlášení</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        /><br /><br />
        <input
          type="password"
          name="password"
          placeholder="Heslo"
          value={formData.password}
          onChange={handleChange}
          required
        /><br /><br />
        <button type="submit">Přihlásit se</button>
      </form>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  );
};

export default LoginPage;
