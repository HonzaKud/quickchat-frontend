import { useState } from 'react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/register`,
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
        setMessage(data.message || 'Registrace selhala');
      } else {
        setMessage('✅ Registrace úspěšná! Můžeš se přihlásit.');
      }
    } catch (error) {
      setMessage('❌ Chyba serveru.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-100 via-blue-100 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/60 border border-slate-300 shadow-xl rounded-3xl p-8 backdrop-blur-md">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold text-indigo-600 mb-2">QuickChat</h1>
          <p className="text-slate-700">Založ si účet a začni konverzovat</p>
          <ul className="mt-2 text-sm text-slate-600 list-disc list-inside space-y-1">
            <li>📝 Rychlá a jednoduchá registrace</li>
            <li>🔐 Zabezpečení pomocí JWT tokenu</li>
            <li>🤝 Spoj se s ostatními uživateli</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-center text-slate-800">Registrace</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Uživatelské jméno"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
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
            Registrovat
          </button>
        </form>

        {message && (
          <p className="text-center mt-4 text-sm text-slate-700">{message}</p>
        )}

        <p className="mt-6 text-sm text-center text-slate-700">
          Už máš účet?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-semibold">
            Přihlas se
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
