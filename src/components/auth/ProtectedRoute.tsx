import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { PageLoader } from '@/components/ui/PageLoader';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}
