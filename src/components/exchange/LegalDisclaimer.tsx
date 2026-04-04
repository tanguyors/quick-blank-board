import { useTranslation } from 'react-i18next';
import iconLegal from '@/assets/icons/legal.png';

export function LegalDisclaimer() {
  const { t } = useTranslation();

  return (
    <div className="bg-card rounded-xl p-4 border border-border space-y-2">
      <div className="flex items-center gap-2">
        <img src={iconLegal} alt="" className="h-6 w-6 object-contain" />
        <h4 className="text-sm font-semibold text-foreground">{t('homeExchange.legalDisclaimer')}</h4>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {t('homeExchange.legalDisclaimerText')}
      </p>
    </div>
  );
}
