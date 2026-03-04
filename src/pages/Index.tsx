import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Home from './Home';
import { PageLoader } from '@/components/ui/PageLoader';

export default function Index() {
  const { user, roles, loading } = useAuth();

  if (loading) return <PageLoader />;
  
  // Non-authenticated users see the landing page
  if (!user) return <Home />;

  const isAdmin = roles.includes('admin');
  const isOwner = roles.includes('owner');
  const isNotaire = roles.includes('notaire');
  const redirectPath = isNotaire ? '/notaire' : (isOwner || isAdmin) ? '/profile' : '/explore';
  return <Navigate to={redirectPath} replace />;
}
