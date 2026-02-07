import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';

export function Header() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Hide header on auth page
  if (pathname === '/auth') return null;

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-background">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <span className="text-primary font-bold text-2xl tracking-tight">𝔫</span>
        <span className="text-foreground font-semibold text-lg">SomaGate</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/profile')} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="h-5 w-5" />
        </button>
        <button onClick={handleSignOut} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
