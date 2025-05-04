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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        {/* Úvodní informace */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">QuickChat</h1>
          <p className="text-gray-700 mb-1">Založ si účet a začni konverzovat</p>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            <li>📝 Rychlá a jednoduchá registrace</li>
            <li>🔐 Zabezpečení přes JWT token</li>
            <li>🤝 Spoj se s dalšími uživateli</li>
          </ul>
        </div>

        {/* Registrační formulář */}
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
          Registrace
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Uživatelské jméno"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            Registrovat
          </button>
        </form>

        {message && (
          <p className="text-center mt-4 text-sm text-gray-700">{message}</p>
        )}

        {/* Odkaz na přihlášení */}
        <p className="mt-6 text-sm text-center text-gray-600">
          Už máš účet?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Přihlas se
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
