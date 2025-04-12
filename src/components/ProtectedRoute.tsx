import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const { user } = useUser();

  // Pokud uživatel není přihlášený, přesměrujeme na login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
