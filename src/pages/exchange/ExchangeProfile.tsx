import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SomaPointsBadge } from '@/components/exchange/SomaPointsBadge';
import { ExchangeReviewsList } from '@/components/exchange/ExchangeReviewsList';
import { ExchangeDocumentUpload } from '@/components/exchange/ExchangeDocumentUpload';
import { CautionInfo } from '@/components/exchange/CautionInfo';
import { LegalDisclaimer } from '@/components/exchange/LegalDisclaimer';
import { usePointsHistory } from '@/hooks/useSomaPoints';

import iconExchange from '@/assets/icons/exchange.png';
import iconPoints from '@/assets/icons/points.png';
import iconReviews from '@/assets/icons/reviews.png';
import iconShield from '@/assets/icons/shield_check.png';

export default function ExchangeProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: pointsHistory } = usePointsHistory();

  return (
    <AppLayout hideHeader>
      <PageTopBar>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/home-exchange')} className="text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <img src={iconExchange} alt="" className="h-6 w-6 object-contain" />
          <span className="font-semibold text-foreground">{t('exchangeNav.profile')}</span>
        </div>
      </PageTopBar>

      <div className="p-4 space-y-4 pb-nav-scroll">
        {/* SOMA Points */}
        <SomaPointsBadge />

        {/* Points History */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <img src={iconPoints} alt="" className="h-5 w-5 object-contain" />
            <h3 className="font-semibold text-foreground text-sm">{t('exchangeNav.pointsHistory')}</h3>
          </div>
          {pointsHistory && pointsHistory.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {pointsHistory.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-foreground text-xs">{tx.description || tx.type}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`font-semibold text-sm ${tx.amount > 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{t('exchangeNav.noPointsHistory')}</p>
          )}
        </div>

        {/* Reviews */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <img src={iconReviews} alt="" className="h-5 w-5 object-contain" />
            <h3 className="font-semibold text-foreground text-sm">{t('exchangeReview.publicReviews')}</h3>
          </div>
          <ExchangeReviewsList userId={user?.id} />
        </div>

        {/* Insurance documents upload */}
        <ExchangeDocumentUpload />

        {/* Caution + Legal */}
        <CautionInfo />
        <LegalDisclaimer />

        {/* Back to main app */}
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => navigate('/explore')}
        >
          <LogOut className="h-4 w-4" />
          {t('exchangeNav.backToApp')}
        </Button>
      </div>
    </AppLayout>
  );
}
