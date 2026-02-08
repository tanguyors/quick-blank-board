import { useLocation, Link } from 'react-router-dom';
import { Flame, Heart, Star, MessageSquare, User, Home, CalendarDays, Shield, Scale, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const buyerLinks = [
  { to: '/buyer', icon: LayoutDashboard, label: 'Accueil' },
  { to: '/explore', icon: Flame, label: 'Découvrir' },
  { to: '/matches', icon: Heart, label: 'Matches' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/profile', icon: User, label: 'Profil' },
];

const ownerLinks = [
  { to: '/dashboard?tab=biens', match: '/dashboard', tab: 'biens', icon: Home, label: 'Mes biens' },
  { to: '/dashboard?tab=visites', match: '/dashboard', tab: 'visites', icon: CalendarDays, label: 'Visites' },
  { to: '/dashboard?tab=messages', match: '/dashboard', tab: 'messages', icon: MessageSquare, label: 'Messages' },
  { to: '/dashboard?tab=profil', match: '/dashboard', tab: 'profil', icon: User, label: 'Profil' },
];

const notaireLinks = [
  { to: '/notaire', icon: Scale, label: 'Dossiers' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/profile', icon: User, label: 'Profil' },
];

const adminLink = { to: '/admin', icon: Shield, label: 'Admin' };

export function BottomNav() {
  const { pathname, search } = useLocation();
  const { roles } = useAuth();
  const { theme, setTheme } = useTheme();
  const isOwner = roles.includes('owner');
  const isAdmin = roles.includes('admin');
  const isNotaire = roles.includes('notaire');

  let links = isNotaire ? notaireLinks : isOwner ? ownerLinks : buyerLinks;

  if (isAdmin) {
    links = [...links.slice(0, -1), adminLink, links[links.length - 1]];
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-safe lg:hidden" aria-label="Navigation mobile">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {links.map((link) => {
          const { to, icon: Icon, label } = link;
          const tabLink = 'tab' in link ? (link as any).tab : null;
          const isActive = tabLink
            ? pathname === '/dashboard' && search === `?tab=${tabLink}`
            : pathname === to || pathname.startsWith(to + '/');
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
              </div>
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex flex-col items-center gap-1 px-3 py-2 text-xs text-muted-foreground transition-colors"
          aria-label="Changer le thème"
        >
          <div className="relative">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </div>
        </button>
      </div>
    </nav>
  );
}
