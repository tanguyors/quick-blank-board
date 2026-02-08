import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import logoSoma from '@/assets/logo-soma.png';

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
    <header className="flex items-center justify-between px-4 py-3 bg-background border-b border-border lg:hidden" role="banner">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate('/')}
        role="link"
        aria-label="Accueil SomaGate"
      >
        <img src={logoSoma} alt="SomaGate" className="h-8 w-8 object-contain" />
        <span className="text-foreground font-semibold text-lg">SomaGate</span>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificationBell />
        <button onClick={() => navigate('/profile')} className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Paramètres">
          <Settings className="h-5 w-5" />
        </button>
        <button onClick={handleSignOut} className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Se déconnecter">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
