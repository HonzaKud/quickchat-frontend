import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');

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
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Přihlášení selhalo');
      } else {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        navigate('/chat');
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ Chyba serveru.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-100 via-blue-100 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/60 border border-slate-300 shadow-xl rounded-3xl p-8 backdrop-blur-md">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold text-indigo-600 mb-2">QuickChat</h1>
          <p className="text-slate-700">Jednoduchá chatovací aplikace</p>
          <ul className="mt-2 text-sm text-slate-600 list-disc list-inside space-y-1">
            <li>📨 Soukromé zprávy mezi uživateli</li>
            <li>⚡ Rychlé přepínání kontaktů</li>
            <li>🔒 Bezpečné přihlášení pomocí tokenu</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-center text-slate-800">Přihlášení</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Heslo"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
          >
            Přihlásit se
          </button>
        </form>

        {message && (
          <p className="text-red-600 text-center mt-4">{message}</p>
        )}

        <p className="mt-6 text-sm text-center text-slate-700">
          Nemáš účet?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline font-semibold">
            Registruj se
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
