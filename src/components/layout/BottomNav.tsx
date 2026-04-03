import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

import iconExplore from '@/assets/icons/appsearch.png';
import iconMatches from '@/assets/icons/matches.png';
import iconMessages from '@/assets/icons/messages.png';
import iconVisits from '@/assets/icons/planning.png';
import iconProfile from '@/assets/icons/accueil.png';
import iconHome from '@/assets/icons/home.png';
import iconAdmin from '@/assets/icons/security.png';
import iconProperties from '@/assets/icons/imeuble.png';
import iconMap from '@/assets/icons/appmap.png';
import iconContrat from '@/assets/icons/contrat.png';

export function BottomNav() {
  const { pathname, search } = useLocation();
  const { roles } = useAuth();
  const { t } = useTranslation();
  const isOwner = roles.includes('owner');
  const isAdmin = roles.includes('admin');
  const isNotaire = roles.includes('notaire');

  const buyerLinks = [
    { to: '/explore', icon: iconExplore, label: t('nav.discover') },
    { to: '/matches', icon: iconMatches, label: t('nav.matches') },
    { to: '/messages', icon: iconMessages, label: t('nav.messages') },
    { to: '/visits', icon: iconVisits, label: t('nav.visits') },
    { to: '/profile', icon: iconProfile, label: t('nav.profile') },
  ];

  const ownerLinks = [
    { to: '/dashboard?tab=biens', match: '/dashboard', tab: 'biens', icon: iconHome, label: t('nav.myProperties') },
    { to: '/dashboard?tab=visites', match: '/dashboard', tab: 'visites', icon: iconVisits, label: t('nav.visits') },
    { to: '/dashboard?tab=messages', match: '/dashboard', tab: 'messages', icon: iconMessages, label: t('nav.messages') },
    { to: '/dashboard?tab=profil', match: '/dashboard', tab: 'profil', icon: iconProfile, label: t('nav.profile') },
  ];

  const notaireLinks = [
    { to: '/notaire', icon: iconContrat, label: t('nav.files') },
    { to: '/messages', icon: iconMessages, label: t('nav.messages') },
    { to: '/profile', icon: iconProfile, label: t('nav.profile') },
  ];

  const adminLinks = [
    { to: '/admin', icon: iconAdmin, label: t('nav.admin') },
    { to: '/admin?tab=properties', match: '/admin', tab: 'properties', icon: iconProperties, label: t('nav.properties') },
    { to: '/admin?tab=visits', match: '/admin', tab: 'visits', icon: iconVisits, label: t('nav.visits') },
    { to: '/admin?tab=map', match: '/admin', tab: 'map', icon: iconMap, label: t('nav.map') },
    { to: '/profile', icon: iconProfile, label: t('nav.profile') },
  ];

  const links = isAdmin ? adminLinks : isNotaire ? notaireLinks : isOwner ? ownerLinks : buyerLinks;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 w-full shrink-0 border-t border-border bg-background lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Navigation mobile"
    >
      <div className="mx-auto flex h-14 max-w-lg items-center justify-around">
        {links.map((link) => {
          const { to, icon, label } = link;
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
                <img src={icon} alt="" className={cn("h-6 w-6 object-contain", !isActive && "opacity-60")} />
              </div>
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
