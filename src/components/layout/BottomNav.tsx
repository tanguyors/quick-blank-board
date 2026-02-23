import { useLocation, Link } from 'react-router-dom';
import { Flame, Heart, MessageSquare, User, Home, CalendarDays, Shield, Scale, Building2, Map } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function BottomNav() {
  const { pathname, search } = useLocation();
  const { roles } = useAuth();
  const { t } = useTranslation();
  const isOwner = roles.includes('owner');
  const isAdmin = roles.includes('admin');
  const isNotaire = roles.includes('notaire');

  const buyerLinks = [
    { to: '/explore', icon: Flame, label: t('nav.discover') },
    { to: '/matches', icon: Heart, label: t('nav.matches') },
    { to: '/messages', icon: MessageSquare, label: t('nav.messages') },
    { to: '/visits', icon: CalendarDays, label: t('nav.visits') },
    { to: '/profile', icon: User, label: t('nav.profile') },
  ];

  const ownerLinks = [
    { to: '/dashboard?tab=biens', match: '/dashboard', tab: 'biens', icon: Home, label: t('nav.myProperties') },
    { to: '/dashboard?tab=visites', match: '/dashboard', tab: 'visites', icon: CalendarDays, label: t('nav.visits') },
    { to: '/dashboard?tab=messages', match: '/dashboard', tab: 'messages', icon: MessageSquare, label: t('nav.messages') },
    { to: '/dashboard?tab=profil', match: '/dashboard', tab: 'profil', icon: User, label: t('nav.profile') },
  ];

  const notaireLinks = [
    { to: '/notaire', icon: Scale, label: t('nav.files') },
    { to: '/messages', icon: MessageSquare, label: t('nav.messages') },
    { to: '/profile', icon: User, label: t('nav.profile') },
  ];

  const adminLinks = [
    { to: '/admin', icon: Shield, label: t('nav.admin') },
    { to: '/admin?tab=properties', match: '/admin', tab: 'properties', icon: Building2, label: t('nav.properties') },
    { to: '/admin?tab=visits', match: '/admin', tab: 'visits', icon: CalendarDays, label: t('nav.visits') },
    { to: '/admin?tab=map', match: '/admin', tab: 'map', icon: Map, label: t('nav.map') },
    { to: '/profile', icon: User, label: t('nav.profile') },
  ];

  const links = isAdmin ? adminLinks : isNotaire ? notaireLinks : isOwner ? ownerLinks : buyerLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-safe lg:hidden" aria-label="Navigation mobile">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {links.map((link) => {
          const { to, icon: Icon, label } = link;
          const tabLink = 'tab' in link ? (link as any).tab : null;
          const matchPath = 'match' in link ? (link as any).match : null;
          const isActive = tabLink
            ? pathname === matchPath && search === `?tab=${tabLink}`
            : pathname === to || pathname.startsWith(to + '/');
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
              </div>
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
