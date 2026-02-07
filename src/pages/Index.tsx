import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function Index() {
  const { user, roles, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  const isOwner = roles.includes('owner');
  return <Navigate to={isOwner ? '/dashboard' : '/explore'} replace />;
}
