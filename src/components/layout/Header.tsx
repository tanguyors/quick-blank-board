import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <h1
        className="text-xl font-bold text-primary cursor-pointer"
        onClick={() => navigate('/')}
      >
        SomaGate
      </h1>
      <Button variant="ghost" size="icon" onClick={handleSignOut}>
        <LogOut className="h-5 w-5" />
      </Button>
    </header>
  );
}
