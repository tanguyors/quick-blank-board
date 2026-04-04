import { useLocation, Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { RoleSwitcher } from './RoleSwitcher';
import { LanguageButtons } from '@/components/ui/LanguageButtons';
import { useTranslation } from 'react-i18next';
import logoSoma from '@/assets/logo-soma.png';

import iconDashboard from '@/assets/icons/dashboard.png';
import iconExplore from '@/assets/icons/appsearch.png';
import iconMatches from '@/assets/icons/matches.png';
import iconFavorites from '@/assets/icons/favorites.png';
import iconMessages from '@/assets/icons/messages.png';
import iconNotifications from '@/assets/icons/notifications.png';
import iconContrat from '@/assets/icons/contrat.png';
import iconHome from '@/assets/icons/home.png';
import iconVisits from '@/assets/icons/planning.png';
import iconAdmin from '@/assets/icons/security.png';
import iconProfile from '@/assets/icons/accueil.png';
import iconDoc from '@/assets/icons/doc.png';
import iconHelp from '@/assets/icons/help.png';
import iconSettings from '@/assets/icons/settings_secure.png';
import iconMap from '@/assets/icons/appmap.png';
import iconVerifiedDoc from '@/assets/icons/verified_doc.png';

export function AppSidebar() {
  const { pathname, search } = useLocation();
  const { activeRole, roles, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isOwner = activeRole === 'owner';
  const isAdmin = activeRole === 'admin';
  const isNotaire = activeRole === 'notaire';
  const canSwitch = roles.includes('user') && roles.includes('owner');

  const buyerLinks = [
    { to: '/buyer', icon: iconDashboard, label: t('nav.dashboard') },
    { to: '/explore', icon: iconExplore, label: t('nav.discover') },
    { to: '/matches', icon: iconMatches, label: t('nav.matches') },
    { to: '/favorites', icon: iconFavorites, label: t('nav.favorites') },
    { to: '/messages', icon: iconMessages, label: t('nav.messages') },
    { to: '/notifications', icon: iconNotifications, label: t('nav.notifications') },
    { to: '/mes-transactions', icon: iconContrat, label: t('nav.transactions') },
    { to: '/home-exchange', icon: iconHome, label: 'Home Exchange' },
  ];

  const ownerLinks = [
    { to: '/dashboard', icon: iconHome, label: t('nav.myProperties') },
    { to: '/visits', icon: iconVisits, label: t('nav.visits') },
    { to: '/messages', icon: iconMessages, label: t('nav.messages') },
    { to: '/notifications', icon: iconNotifications, label: t('nav.notifications') },
    { to: '/mes-transactions', icon: iconContrat, label: t('nav.transactions') },
    { to: '/home-exchange', icon: iconHome, label: 'Home Exchange' },
  ];

  const notaireLinks = [
    { to: '/notaire', icon: iconContrat, label: t('nav.files') },
    { to: '/messages', icon: iconMessages, label: t('nav.messages') },
    { to: '/notifications', icon: iconNotifications, label: t('nav.notifications') },
  ];

  const adminLinks = [
    { to: '/admin', icon: iconAdmin, label: t('nav.overview') },
    { to: '/admin?tab=users', icon: iconDashboard, label: t('nav.users') },
    { to: '/admin?tab=properties', icon: iconHome, label: t('nav.properties') },
    { to: '/admin?tab=visits', icon: iconVisits, label: t('nav.visits') },
    { to: '/admin?tab=transactions', icon: iconContrat, label: t('nav.transactions') },
    { to: '/admin?tab=map', icon: iconMap, label: t('nav.map') },
    { to: '/admin?tab=notifications', icon: iconNotifications, label: t('nav.notifications') },
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

      {canSwitch && (
        <div className="px-3 pt-3">
          <RoleSwitcher variant="full" className="w-full justify-center" />
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, icon, label }) => {
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
              <img src={icon} alt="" className={cn("h-5 w-5 object-contain shrink-0", !isActive && "opacity-60")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 space-y-1">
        <Link to="/actualites" className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors", pathname === '/actualites' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
          <img src={iconDoc} alt="" className="h-4 w-4 object-contain shrink-0" />
          <span>{t('home.features')}</span>
        </Link>
        <Link to="/assistance" className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors", pathname === '/assistance' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
          <img src={iconHelp} alt="" className="h-4 w-4 object-contain shrink-0" />
          <span>{t('home.help')}</span>
        </Link>
        <Link to="/confidentialite" className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors", pathname === '/confidentialite' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
          <img src={iconAdmin} alt="" className="h-4 w-4 object-contain shrink-0" />
          <span>{t('home.privacy')}</span>
        </Link>
        <Link to="/cgu" className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors", pathname === '/cgu' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
          <img src={iconVerifiedDoc} alt="" className="h-4 w-4 object-contain shrink-0" />
          <span>{t('home.cgu')}</span>
        </Link>

        <div className="border-t border-border mt-2 pt-2">
          <div className="px-2 py-2">
            <LanguageButtons dense className="gap-0.5" />
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
            <img src={iconProfile} alt="" className="h-5 w-5 object-contain shrink-0" />
            <span className="truncate">{profile?.full_name || t('nav.profile')}</span>
          </Link>

          <div className="flex items-center justify-between px-3 py-1">
            <ThemeToggle />
            <button onClick={() => navigate('/account-settings')} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg" aria-label="Paramètres">
              <img src={iconSettings} alt="" className="h-5 w-5 object-contain" />
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
