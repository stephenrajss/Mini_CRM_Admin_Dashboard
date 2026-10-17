import { useAuth } from '../context/AuthContext';
import ForbiddenPage from '../pages/ForbiddenPage';

export function RoleGuard(props) {
  const { roles, children } = props;
  
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return <ForbiddenPage />;
  }
  return children;
}