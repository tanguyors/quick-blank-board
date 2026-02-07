import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Flame, Heart, MessageSquare, User, Home, CalendarDays,
  Shield, Scale, LayoutDashboard, LogOut, Settings, Bell,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';

const buyerLinks = [
  { to: '/buyer', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/explore', icon: Flame, label: 'Découvrir' },
  { to: '/matches', icon: Heart, label: 'Favoris' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/mes-transactions', icon: Scale, label: 'Transactions' },
];

const ownerLinks = [
  { to: '/dashboard', icon: Home, label: 'Mes biens' },
  { to: '/visits', icon: CalendarDays, label: 'Visites' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/mes-transactions', icon: Scale, label: 'Transactions' },
];

const notaireLinks = [
  { to: '/notaire', icon: Scale, label: 'Dossiers' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

const adminLink = { to: '/admin', icon: Shield, label: 'Administration' };

export function AppSidebar() {
  const { pathname } = useLocation();
  const { roles, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const isOwner = roles.includes('owner');
  const isAdmin = roles.includes('admin');
  const isNotaire = roles.includes('notaire');

  let links = isNotaire ? notaireLinks : isOwner ? ownerLinks : buyerLinks;
  if (isAdmin) {
    links = [...links, adminLink];
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0" aria-label="Navigation principale">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <span className="text-primary font-bold text-2xl tracking-tight">𝔫</span>
        <span className="text-foreground font-semibold text-lg">SomaGate</span>
      </Link>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => {
          const isActive = pathname === to || pathname.startsWith(to + '/');
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

      {/* Bottom section */}
      <div className="border-t border-border p-3 space-y-1">
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
          <span className="truncate">{profile?.full_name || 'Profil'}</span>
        </Link>

        <div className="flex items-center justify-between px-3 py-1">
          <ThemeToggle />
          <button
            onClick={() => navigate('/profile')}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg"
            aria-label="Paramètres"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            onClick={handleSignOut}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg"
            aria-label="Se déconnecter"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
