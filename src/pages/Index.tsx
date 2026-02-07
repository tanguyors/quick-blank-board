import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Home from './Home';

export default function Index() {
  const { user, roles, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  
  // Non-authenticated users see the landing page
  if (!user) return <Home />;

  const isOwner = roles.includes('owner');
  return <Navigate to={isOwner ? '/dashboard' : '/explore'} replace />;
}
