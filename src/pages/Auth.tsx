import { AuthForm } from '@/components/auth/AuthForm';
import { useAllowScroll } from '@/hooks/useAllowScroll';
import { PwaInstallFloat } from '@/components/pwa/PwaInstallFloat';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function Auth() {
  useAllowScroll();
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
  if (user) return <Navigate to="/" replace />;

  return (
    <>
      <AuthForm />
      <PwaInstallFloat />
    </>
  );
}
