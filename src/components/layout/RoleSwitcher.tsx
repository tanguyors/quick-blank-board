import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import iconExplore from '@/assets/icons/appsearch.png';
import iconHome from '@/assets/icons/home.png';

export function RoleSwitcher({ variant = 'compact', className }: { variant?: 'compact' | 'full'; className?: string }) {
  const { roles, activeRole, setActiveRole } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const canSwitch = roles.includes('user') && roles.includes('owner');
  if (!canSwitch) return null;

  const isBuyer = activeRole === 'user';

  const handleSwitch = () => {
    const newRole = isBuyer ? 'owner' : 'user';
    setActiveRole(newRole);
    navigate(newRole === 'owner' ? '/dashboard' : '/explore', { replace: true });
  };

  if (variant === 'full') {
    return (
      <button
        onClick={handleSwitch}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition-all",
          "border border-border bg-card hover:bg-primary/10 active:scale-95",
          className
        )}
        aria-label={t('roles.switchRole')}
      >
        <ArrowLeftRight className="h-4 w-4" />
        <span>{isBuyer ? t('roles.switchToOwner') : t('roles.switchToBuyer')}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleSwitch}
      className={cn(
        "relative p-2 rounded-lg transition-all active:scale-90",
        "text-muted-foreground hover:text-foreground hover:bg-muted",
        className
      )}
      aria-label={isBuyer ? t('roles.switchToOwner') : t('roles.switchToBuyer')}
      title={isBuyer ? t('roles.switchToOwner') : t('roles.switchToBuyer')}
    >
      <img
        src={isBuyer ? iconHome : iconExplore}
        alt=""
        className="h-5 w-5 object-contain"
      />
      <ArrowLeftRight className="absolute -bottom-0.5 -right-0.5 h-3 w-3 text-primary" />
    </button>
  );
}
