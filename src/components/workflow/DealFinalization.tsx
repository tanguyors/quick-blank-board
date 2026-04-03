import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';
import type { WfTransaction } from '@/types/workflow';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface DealFinalizationProps {
  transaction: WfTransaction;
  onFinalize: () => Promise<any>;
  isLoading: boolean;
}

export function DealFinalization({ transaction, onFinalize, isLoading }: DealFinalizationProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isBuyer = user?.id === transaction.buyer_id;
  const myValidated = isBuyer ? transaction.buyer_validated : transaction.seller_validated;
  const otherValidated = isBuyer ? transaction.seller_validated : transaction.buyer_validated;

  const handleFinalize = async () => {
    await onFinalize();
    toast.success(otherValidated
      ? t('deal.finalizedToast')
      : t('deal.validationRecorded')
    );
  };

  if (myValidated && otherValidated) {
    return (
      <div className="bg-card rounded-xl p-6 border border-emerald-500/30 text-center space-y-3">
        <PartyPopper className="h-12 w-12 text-emerald-400 mx-auto" />
        <h3 className="font-bold text-foreground text-lg">{t('deal.finalized')}</h3>
        <p className="text-muted-foreground text-sm">
          {t('deal.congratulations')}
        </p>
      </div>
    );
  }

  if (myValidated) {
    return (
      <div className="bg-card rounded-xl p-4 border border-border space-y-2">
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle className="h-5 w-5" />
          <h3 className="font-semibold">{t('deal.youValidated')}</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {isBuyer ? t('deal.waitingSellerValidation') : t('deal.waitingBuyerValidation')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border space-y-3">
      <h3 className="font-semibold text-foreground">{t('deal.finalizeDeal')}</h3>
      <p className="text-sm text-muted-foreground">
        {t('deal.allDocsValidated')}
        {otherValidated && (
          <span className="block mt-1 text-emerald-400">
            ✓ {t('deal.otherPartyConfirmed')}
          </span>
        )}
      </p>
      <Button className="w-full" onClick={handleFinalize} disabled={isLoading}>
        {isLoading ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t('deal.finalizing')}</>
        ) : (
          <><CheckCircle className="h-4 w-4 mr-2" /> {t('deal.finalizeDeal')}</>
        )}
      </Button>
    </div>
  );
}
