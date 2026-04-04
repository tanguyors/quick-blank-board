import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield } from 'lucide-react';

interface Props {
  insuranceConfirmed: boolean;
  exchangeAllowedConfirmed: boolean;
  onInsuranceChange: (v: boolean) => void;
  onExchangeAllowedChange: (v: boolean) => void;
}

export function InsuranceCheckboxes({ insuranceConfirmed, exchangeAllowedConfirmed, onInsuranceChange, onExchangeAllowedChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-semibold text-foreground">Conditions obligatoires</span>
      </div>
      <label className="flex items-start gap-3 cursor-pointer">
        <Checkbox
          checked={insuranceConfirmed}
          onCheckedChange={(v) => onInsuranceChange(v === true)}
          className="mt-0.5"
        />
        <span className="text-sm text-muted-foreground leading-tight">
          {t('homeExchange.insuranceConfirm')}
        </span>
      </label>
      <label className="flex items-start gap-3 cursor-pointer">
        <Checkbox
          checked={exchangeAllowedConfirmed}
          onCheckedChange={(v) => onExchangeAllowedChange(v === true)}
          className="mt-0.5"
        />
        <span className="text-sm text-muted-foreground leading-tight">
          {t('homeExchange.exchangeAllowedConfirm')}
        </span>
      </label>
    </div>
  );
}
