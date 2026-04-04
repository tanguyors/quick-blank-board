import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { useMyTransactions } from '@/hooks/useTransaction';
import { TransactionStatusBadge } from '@/components/workflow/TransactionStatus';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { useTranslation } from 'react-i18next';
import type { TransactionStatus } from '@/types/workflow';

import iconContrat from '@/assets/icons/contrat.png';

function getNextAction(status: TransactionStatus, isBuyer: boolean): { label: string; urgent: boolean } | null {
  if (isBuyer) {
    switch (status) {
      case 'matched': return { label: 'Demander une visite', urgent: false };
      case 'visit_proposed': return { label: 'Confirmer une date', urgent: true };
      case 'visit_completed': return { label: 'Donner votre intention', urgent: true };
      case 'intention_expressed': return { label: 'Faire une offre', urgent: false };
      case 'documents_generated': return { label: 'Vérifier les documents', urgent: true };
      case 'in_validation': return { label: 'Valider les documents', urgent: true };
      default: return null;
    }
  } else {
    switch (status) {
      case 'visit_requested': return { label: 'Proposer des dates', urgent: true };
      case 'visit_proposed': return { label: 'Confirmer une date', urgent: false };
      case 'offer_made': return { label: 'Répondre à l\'offre', urgent: true };
      case 'documents_generated': return { label: 'Vérifier les documents', urgent: true };
      case 'in_validation': return { label: 'Valider les documents', urgent: true };
      default: return null;
    }
  }
}

export default function MyTransactions() {
  const { t } = useTranslation();
  const { data: transactions, isLoading } = useMyTransactions();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');

  const filtered = (transactions || []).filter(tx => {
    if (filter === 'active') return !['deal_finalized', 'deal_cancelled', 'archived'].includes(tx.status);
    if (filter === 'done') return ['deal_finalized', 'deal_cancelled', 'archived'].includes(tx.status);
    return true;
  });

  const activeCount = (transactions || []).filter(tx => !['deal_finalized', 'deal_cancelled', 'archived'].includes(tx.status)).length;
  const actionRequired = (transactions || []).filter(tx => {
    const isBuyer = tx.buyer_id === user?.id;
    return !!getNextAction(tx.status as TransactionStatus, isBuyer)?.urgent;
  }).length;

  return (
    <AppLayout hideHeader>
      <PageTopBar>
        <div className="flex items-center gap-2">
          <img src={iconContrat} alt="" className="h-6 w-6 object-contain" />
          <span className="font-semibold text-foreground">Suivi</span>
          {actionRequired > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
              {actionRequired}
            </span>
          )}
        </div>
      </PageTopBar>

      <div className="p-4 space-y-4 pb-nav-scroll">
        {/* Filters */}
        <div className="flex bg-secondary rounded-full p-1">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-colors ${filter === 'all' ? 'bg-foreground text-background' : 'text-muted-foreground'}`}
          >
            Toutes ({transactions?.length || 0})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-colors ${filter === 'active' ? 'bg-foreground text-background' : 'text-muted-foreground'}`}
          >
            En cours ({activeCount})
          </button>
          <button
            onClick={() => setFilter('done')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-colors ${filter === 'done' ? 'bg-foreground text-background' : 'text-muted-foreground'}`}
          >
            Terminées
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-8">
            <img src={iconContrat} alt="" className="h-12 w-12 object-contain mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">{t('transaction.noTransaction')}</p>
            <p className="text-muted-foreground/60 text-xs mt-1">{t('transaction.transactionsWillAppear')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(tx => {
              const property = tx.properties as any;
              const isBuyer = tx.buyer_id === user?.id;
              const primaryMedia = property?.property_media?.find((m: any) => m.is_primary) || property?.property_media?.[0];
              const action = getNextAction(tx.status as TransactionStatus, isBuyer);

              return (
                <div
                  key={tx.id}
                  className={`bg-card rounded-xl border overflow-hidden cursor-pointer transition-colors ${action?.urgent ? 'border-primary/50' : 'border-border hover:border-primary/30'}`}
                  onClick={() => navigate(`/transaction/${tx.id}`)}
                >
                  <div className="flex">
                    {primaryMedia ? (
                      <img src={primaryMedia.url} alt="" className="w-24 h-28 object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-24 h-28 bg-secondary flex items-center justify-center flex-shrink-0">
                        <img src={iconContrat} alt="" className="h-8 w-8 object-contain opacity-30" />
                      </div>
                    )}
                    <div className="flex-1 p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <p className="font-semibold text-foreground text-sm capitalize">
                            {property?.type || 'Bien'}
                          </p>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(tx.updated_at), 'dd MMM', { locale: fr })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3" />
                          <span className="text-xs truncate">{property?.adresse || ''}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <TransactionStatusBadge status={tx.status as TransactionStatus} />
                          <span className="text-[10px] text-muted-foreground">
                            {isBuyer ? 'Acheteur' : 'Vendeur'}
                          </span>
                        </div>
                      </div>

                      {action && (
                        <div className={`flex items-center gap-1.5 mt-2 px-2 py-1 rounded-lg text-xs font-medium ${action.urgent ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                          {action.urgent && <AlertCircle className="h-3 w-3" />}
                          <span>{action.label}</span>
                          <ArrowRight className="h-3 w-3 ml-auto" />
                        </div>
                      )}
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
