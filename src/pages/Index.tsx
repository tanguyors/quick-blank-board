import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Home from './Home';
import { PageLoader } from '@/components/ui/PageLoader';

export default function Index() {
  const { user, activeRole, loading } = useAuth();

  if (loading) return <PageLoader />;

  // Non-authenticated users see the landing page
  if (!user) return <Home />;

  const redirectPath = activeRole === 'notaire' ? '/notaire'
    : activeRole === 'admin' ? '/admin'
    : activeRole === 'owner' ? '/dashboard'
    : '/explore';
  return <Navigate to={redirectPath} replace />;
}
