import { useTranslation } from 'react-i18next';
import iconCaution from '@/assets/icons/caution.png';

export function CautionInfo() {
  const { t } = useTranslation();

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2">
        <img src={iconCaution} alt="" className="h-6 w-6 object-contain" />
        <h4 className="text-sm font-bold text-foreground">{t('homeExchange.cautionTitle')}</h4>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {t('homeExchange.cautionDesc')}
      </p>
      <p className="text-xs text-primary/70 italic">
        {t('homeExchange.cautionMvp')}
      </p>
    </div>
  );
}
