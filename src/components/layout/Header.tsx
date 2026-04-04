import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { RoleSwitcher } from './RoleSwitcher';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { LanguageButtons } from '@/components/ui/LanguageButtons';
import logoSoma from '@/assets/logo-soma.png';
import iconSettings from '@/assets/icons/settings_secure.png';

export function Header() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (pathname === '/auth') return null;

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 flex shrink-0 flex-col gap-2 border-b border-border bg-background px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] lg:hidden"
      role="banner"
    >
      <div className="flex items-center justify-between gap-2">
      <div
        className="flex cursor-pointer items-center gap-2"
        onClick={() => navigate('/')}
        role="link"
        aria-label="Accueil SomaGate"
      >
        <img src={logoSoma} alt="SomaGate" className="h-8 w-8 object-contain" />
        <span className="text-lg font-semibold text-foreground">SomaGate</span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <ThemeToggle />
        <NotificationBell />
        <button onClick={() => navigate('/profile')} className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Paramètres">
          <img src={iconSettings} alt="" className="h-5 w-5 object-contain" />
        </button>
        <button onClick={handleSignOut} className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Se déconnecter">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
        <RoleSwitcher />
        <LanguageButtons dense className="min-w-min flex-nowrap" />
      </div>
    </header>
  );
}
