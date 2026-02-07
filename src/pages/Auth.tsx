import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function Auth() {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">SomaGate</h1>
        <p className="text-muted-foreground mt-1">L'immobilier à portée de main</p>
      </div>
      <AuthForm />
    </div>
  );
}
