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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        {/* Úvodní popis */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">QuickChat</h1>
          <p className="text-gray-700 mb-1">Jednoduchá chatovací aplikace</p>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li>📨 Soukromé zprávy mezi uživateli</li>
            <li>⚡ Rychlé přepínání kontaktů</li>
            <li>🔒 Zabezpečené přihlášení pomocí tokenu</li>
          </ul>
        </div>

        {/* Přihlašovací formulář */}
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">Přihlášení</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Heslo"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Přihlásit se
          </button>
        </form>

        {message && (
          <p className="text-red-600 text-center mt-4">{message}</p>
        )}

        {/* Odkaz na registraci */}
        <p className="mt-6 text-sm text-center text-gray-600">
          Nemáš účet?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Registruj se
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
