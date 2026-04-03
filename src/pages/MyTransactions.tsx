import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { useMyTransactions } from '@/hooks/useTransaction';
import { TransactionStatusBadge } from '@/components/workflow/TransactionStatus';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, ArrowRight, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { useTranslation } from 'react-i18next';
import type { TransactionStatus } from '@/types/workflow';

export default function MyTransactions() {
  const { t } = useTranslation();
  const { data: transactions, isLoading } = useMyTransactions();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <AppLayout hideHeader>
      <PageTopBar>
        <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-foreground font-semibold">{t('transaction.myTransactions')}</span>
        </div>
      </PageTopBar>
      <div className="p-4 max-w-lg mx-auto">

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : !transactions?.length ? (
          <div className="text-center p-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">Aucune transaction en cours</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Vos transactions apparaîtront ici après un match.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map(tx => {
              const property = tx.properties as any;
              const isBuyer = tx.buyer_id === user?.id;
              const primaryMedia = property?.property_media?.find((m: any) => m.is_primary) || property?.property_media?.[0];

              return (
                <div
                  key={tx.id}
                  onClick={() => navigate(`/transaction/${tx.id}`)}
                  className="bg-card rounded-xl border border-border overflow-hidden cursor-pointer hover:border-primary/30 transition-colors"
                >
                  <div className="flex">
                    {primaryMedia && (
                      <img src={primaryMedia.url} alt="" className="w-24 h-24 object-cover" />
                    )}
                    <div className="flex-1 p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-foreground text-sm capitalize">
                            {property?.type || 'Bien'}
                          </p>
                          <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                            <MapPin className="h-3 w-3" />
                            <span className="text-xs">{property?.adresse || ''}</span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <TransactionStatusBadge status={tx.status as TransactionStatus} />
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(tx.updated_at), 'dd MMM', { locale: fr })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isBuyer ? t('dashboard.buyer') : t('dashboard.seller')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
