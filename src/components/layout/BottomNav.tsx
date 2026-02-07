import { useLocation, Link } from 'react-router-dom';
import { Home, Search, Heart, MessageSquare, User, CalendarDays, Map } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const buyerLinks = [
  { to: '/explore', icon: Search, label: 'Explorer' },
  { to: '/map', icon: Map, label: 'Carte' },
  { to: '/matches', icon: Heart, label: 'Matches' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/profile', icon: User, label: 'Profil' },
];

const ownerLinks = [
  { to: '/dashboard', icon: Home, label: 'Mes biens' },
  { to: '/visits', icon: CalendarDays, label: 'Visites' },
  { to: '/matches', icon: Heart, label: 'Matches' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/profile', icon: User, label: 'Profil' },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const { roles } = useAuth();
  const isOwner = roles.includes('owner');
  const links = isOwner ? ownerLinks : buyerLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
              pathname === to || pathname.startsWith(to + '/')
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
