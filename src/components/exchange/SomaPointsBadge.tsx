import { usePointsBalance } from '@/hooks/useSomaPoints';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import iconPoints from '@/assets/icons/points.png';

export function SomaPointsBadge({ userId, className }: { userId?: string; className?: string }) {
  const { data } = usePointsBalance(userId);
  const { t } = useTranslation();

  return (
    <div className={cn("flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl px-4 py-2.5", className)}>
      <img src={iconPoints} alt="" className="h-8 w-8 object-contain" />
      <div>
        <p className="text-xs text-muted-foreground">{t('homeExchange.somaPoints')}</p>
        <p className="text-lg font-bold text-foreground">{data?.balance ?? 0} <span className="text-xs font-normal text-muted-foreground">pts</span></p>
      </div>
    </div>
  );
}
