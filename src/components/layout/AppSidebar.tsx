import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Flame, Heart, Star, MessageSquare, User, Home, CalendarDays,
  Shield, Scale, LayoutDashboard, LogOut, Settings, Bell,
  Newspaper, HelpCircle, Lock, FileText,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { useTranslation } from 'react-i18next';
import logoSoma from '@/assets/logo-soma.png';

export function AppSidebar() {
  const { pathname, search } = useLocation();
  const { roles, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isOwner = roles.includes('owner');
  const isAdmin = roles.includes('admin');
  const isNotaire = roles.includes('notaire');

  const buyerLinks = [
    { to: '/buyer', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/explore', icon: Flame, label: t('nav.discover') },
    { to: '/matches', icon: Heart, label: t('nav.matches') },
    { to: '/favorites', icon: Star, label: t('nav.favorites') },
    { to: '/messages', icon: MessageSquare, label: t('nav.messages') },
    { to: '/notifications', icon: Bell, label: t('nav.notifications') },
    { to: '/mes-transactions', icon: Scale, label: t('nav.transactions') },
  ];

  const ownerLinks = [
    { to: '/dashboard', icon: Home, label: t('nav.myProperties') },
    { to: '/visits', icon: CalendarDays, label: t('nav.visits') },
    { to: '/messages', icon: MessageSquare, label: t('nav.messages') },
    { to: '/notifications', icon: Bell, label: t('nav.notifications') },
    { to: '/mes-transactions', icon: Scale, label: t('nav.transactions') },
  ];

  const notaireLinks = [
    { to: '/notaire', icon: Scale, label: t('nav.files') },
    { to: '/messages', icon: MessageSquare, label: t('nav.messages') },
    { to: '/notifications', icon: Bell, label: t('nav.notifications') },
  ];

  const adminLinks = [
    { to: '/admin', icon: Shield, label: t('nav.overview') },
    { to: '/admin?tab=users', icon: LayoutDashboard, label: t('nav.users') },
    { to: '/admin?tab=properties', icon: Home, label: t('nav.properties') },
    { to: '/admin?tab=visits', icon: CalendarDays, label: t('nav.visits') },
    { to: '/admin?tab=transactions', icon: Scale, label: t('nav.transactions') },
    { to: '/admin?tab=map', icon: Flame, label: t('nav.map') },
    { to: '/admin?tab=notifications', icon: Bell, label: t('nav.notifications') },
  ];

  const links = isAdmin ? adminLinks : isNotaire ? notaireLinks : isOwner ? ownerLinks : buyerLinks;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0" aria-label="Navigation principale">
      <Link to="/" className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <img src={logoSoma} alt="SomaGate" className="h-8 w-8 object-contain" />
        <span className="text-foreground font-semibold text-lg">SomaGate</span>
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => {
          const [linkPath, linkQuery] = to.split('?');
          const isActive = linkQuery
            ? pathname === linkPath && search === `?${linkQuery}`
            : pathname === to || pathname.startsWith(to + '/');
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 space-y-1">
        <Link to="/actualites" className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors", pathname === '/actualites' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
          <Newspaper className="h-4 w-4 shrink-0" />
          <span>{t('home.features')}</span>
        </Link>
        <Link to="/assistance" className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors", pathname === '/assistance' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
          <HelpCircle className="h-4 w-4 shrink-0" />
          <span>{t('home.help')}</span>
        </Link>
        <Link to="/confidentialite" className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors", pathname === '/confidentialite' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
          <Lock className="h-4 w-4 shrink-0" />
          <span>{t('home.privacy')}</span>
        </Link>
        <Link to="/cgu" className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors", pathname === '/cgu' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
          <FileText className="h-4 w-4 shrink-0" />
          <span>{t('home.cgu')}</span>
        </Link>

        <div className="border-t border-border mt-2 pt-2">
          <div className="px-3 py-2">
            <LanguageSelector compact />
          </div>
          <Link
            to="/profile"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === '/profile'
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <User className="h-5 w-5 shrink-0" />
            <span className="truncate">{profile?.full_name || t('nav.profile')}</span>
          </Link>

          <div className="flex items-center justify-between px-3 py-1">
            <ThemeToggle />
            <button onClick={() => navigate('/account-settings')} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg" aria-label="Paramètres">
              <Settings className="h-5 w-5" />
            </button>
            <button onClick={handleSignOut} className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg" aria-label="Se déconnecter">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
