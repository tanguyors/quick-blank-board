import { useNavigate } from 'react-router-dom';
import { useExchangeAccess } from '@/hooks/useExchangeDocuments';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock } from 'lucide-react';

import iconExchange from '@/assets/icons/exchange.png';
import iconShield from '@/assets/icons/shield_check.png';

export function ExchangeGate({ children }: { children: React.ReactNode }) {
  const { allApproved, isLoading } = useExchangeAccess();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <AppLayout hideHeader>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!allApproved) {
    return (
      <AppLayout hideHeader>
        <PageTopBar>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/explore')} className="text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <img src={iconExchange} alt="" className="h-6 w-6 object-contain" />
            <span className="font-semibold text-foreground">Home Exchange</span>
          </div>
        </PageTopBar>

        <div className="p-6 flex flex-col items-center justify-center text-center space-y-6 pt-20">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Lock className="h-10 w-10 text-amber-500" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">Accès verrouillé</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Pour accéder à Home Exchange, vous devez d'abord soumettre et faire valider vos documents obligatoires.
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-4 w-full max-w-sm space-y-3">
            <div className="flex items-center gap-2">
              <img src={iconShield} alt="" className="h-5 w-5 object-contain" />
              <h3 className="font-semibold text-foreground text-sm">Documents requis</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">1.</span>
                {t('homeExchange.insuranceConfirm')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">2.</span>
                {t('homeExchange.exchangeAllowedConfirm')}
              </li>
            </ul>
          </div>

          <Button onClick={() => navigate('/account-settings')} className="w-full max-w-sm gap-2">
            <img src={iconShield} alt="" className="h-4 w-4 object-contain" />
            Soumettre mes documents
          </Button>
        </div>
      </AppLayout>
    );
  }

  return <>{children}</>;
}
