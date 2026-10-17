import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FullPageSpinner } from './LoadingSpinner';

export function ProtectedRoute({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <FullPageSpinner />;
  }
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

export function GuestRoute({ children }) {
  const { status } = useAuth();
  if (status === 'loading') {
    return <FullPageSpinner />;
  }
  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }
  return children;
}
