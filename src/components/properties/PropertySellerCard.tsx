import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CertifiedBadge } from '@/components/ui/CertifiedBadge';
import { cn } from '@/lib/utils';
import type { OwnerProfilePublic, OwnerScorePublic } from '@/lib/enrichPropertySellers';

function sellerDisplayName(profile: OwnerProfilePublic | null | undefined): string | null {
  if (!profile) return null;
  const full = profile.full_name?.trim();
  if (full) return full;
  const parts = [profile.first_name, profile.last_name].filter(Boolean);
  if (parts.length) return parts.join(' ');
  return null;
}

interface PropertySellerCardProps {
  profile: OwnerProfilePublic | null | undefined;
  score: OwnerScorePublic | null | undefined;
  variant?: 'default' | 'compact';
  className?: string;
}

export function PropertySellerCard({ profile, score, variant = 'default', className }: PropertySellerCardProps) {
  const { t } = useTranslation();
  const name = sellerDisplayName(profile) || t('property.seller');
  const scoreValue = score?.score ?? 50;
  const scoreLevelKey = scoreValue >= 80 ? 'expert' : scoreValue >= 60 ? 'active' : scoreValue >= 40 ? 'observer' : 'beginner';
  const scoreEmoji = scoreValue >= 80 ? '🔥' : scoreValue >= 60 ? '⭐' : '🌱';

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl border border-border/80 bg-background/90 px-3 py-2.5 backdrop-blur-sm',
          className,
        )}
      >
        <Avatar className="h-10 w-10 shrink-0 border border-border">
          {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt="" className="object-cover" /> : null}
          <AvatarFallback className="bg-secondary text-xs font-semibold text-foreground">
            {name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{name}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t('profile.heatScore')}</span>
            <span className="text-xs font-bold text-foreground">
              {Math.round(scoreValue / 10)}
              <span className="font-normal text-muted-foreground">/10</span>
            </span>
            <span className="text-xs" aria-hidden>
              {scoreEmoji}
            </span>
          </div>
          <div className="mt-1.5 h-1 max-w-[140px] overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${scoreValue}%` }} />
          </div>
        </div>
        {score?.certified && (
          <CertifiedBadge size="sm" className="shrink-0" />
        )}
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
      <p className="mb-3 text-sm font-semibold text-foreground">{t('property.sellerProfile')}</p>
      <div className="flex items-start gap-3">
        <Avatar className="h-14 w-14 shrink-0 border border-border">
          {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt="" className="object-cover" /> : null}
          <AvatarFallback className="bg-secondary text-lg font-semibold text-foreground">
            {name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">{name}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>
                {scoreEmoji}
              </span>
              <div>
                <p className="text-xs text-muted-foreground">{t('profile.heatScore')}</p>
                <p className="text-sm font-medium text-foreground">{t(`profile.${scoreLevelKey}`)}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-foreground">{Math.round(scoreValue / 10)}</span>
              <span className="text-sm text-muted-foreground">/10</span>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${scoreValue}%` }} />
          </div>
          {score?.certified && (
            <div className="mt-2">
              <CertifiedBadge size="sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
