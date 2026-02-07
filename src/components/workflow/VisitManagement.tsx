import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, X, Check } from 'lucide-react';
import { SecurityBanner } from './SecurityAlert';
import { TransactionStatusBadge } from './TransactionStatus';
import type { TransactionStatus, WfTransaction } from '@/types/workflow';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface VisitManagementProps {
  transaction: WfTransaction;
  onRequestVisit: () => Promise<any>;
  onProposeVisitDates: (dates: { date: string; preference: number }[]) => Promise<any>;
  onConfirmVisit: (date: string) => Promise<any>;
  onCompleteVisit: (wasPresent: boolean) => Promise<any>;
  onExpressIntention: (args: { intention: 'continue' | 'offer' | 'stop'; reason?: string; details?: string }) => Promise<any>;
  isLoading: boolean;
}

export function VisitManagement({
  transaction,
  onRequestVisit,
  onProposeVisitDates,
  onConfirmVisit,
  onCompleteVisit,
  onExpressIntention,
  isLoading,
}: VisitManagementProps) {
  const { user } = useAuth();
  const isBuyer = user?.id === transaction.buyer_id;
  const isSeller = user?.id === transaction.seller_id;
  const status = transaction.status as TransactionStatus;

  return (
    <div className="space-y-4 p-4">
      <SecurityBanner type="no_show_warning" />

      {/* Request visit - buyer only when matched */}
      {status === 'matched' && isBuyer && (
        <RequestVisitCard onRequest={onRequestVisit} isLoading={isLoading} />
      )}

      {status === 'matched' && isSeller && (
        <WaitingCard message="En attente d'une demande de visite de l'acheteur." />
      )}

      {/* Propose dates - seller only when visit_requested */}
      {status === 'visit_requested' && isSeller && (
        <ProposeDatesCard onPropose={onProposeVisitDates} isLoading={isLoading} />
      )}

      {status === 'visit_requested' && isBuyer && (
        <WaitingCard message="Votre demande de visite a été envoyée. En attente de réponse du propriétaire." />
      )}

      {/* Confirm visit - both parties when visit_proposed */}
      {status === 'visit_proposed' && (
        <ConfirmVisitCard
          transaction={transaction}
          onConfirm={onConfirmVisit}
          isBuyer={isBuyer}
          isLoading={isLoading}
        />
      )}

      {/* Visit confirmed - waiting for visit */}
      {status === 'visit_confirmed' && (
        <div className="bg-card rounded-xl p-4 border border-green-500/30 space-y-3">
          <div className="flex items-center gap-2 text-green-400">
            <Check className="h-5 w-5" />
            <h3 className="font-semibold">Visite confirmée !</h3>
          </div>
          {transaction.visit_confirmed_date && (
            <p className="text-muted-foreground text-sm">
              📅 {new Date(transaction.visit_confirmed_date).toLocaleDateString('fr-FR', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          )}
        </div>
      )}

      {/* Complete visit validation */}
      {status === 'visit_confirmed' && (
        <CompleteVisitCard onComplete={onCompleteVisit} isLoading={isLoading} />
      )}

      {/* Express intention after visit */}
      {status === 'visit_completed' && isBuyer && (
        <IntentionCard onExpress={onExpressIntention} isLoading={isLoading} />
      )}

      {status === 'visit_completed' && isSeller && (
        <WaitingCard message="En attente de la décision de l'acheteur après la visite." />
      )}

      {/* Cancelled */}
      {status === 'visit_cancelled' && (
        <div className="bg-card rounded-xl p-4 border border-red-500/30">
          <p className="text-red-400 font-medium">Visite annulée</p>
          {transaction.visit_refusal_reason && (
            <p className="text-muted-foreground text-sm mt-2">Raison: {transaction.visit_refusal_reason}</p>
          )}
          {isBuyer && (
            <Button className="mt-3 w-full" onClick={onRequestVisit} disabled={isLoading}>
              Redemander une visite
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function RequestVisitCard({ onRequest, isLoading }: { onRequest: () => Promise<any>; isLoading: boolean }) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border space-y-3">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Demander une visite</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Vous avez matché avec ce bien ! Demandez une visite pour le découvrir.
      </p>
      <Button className="w-full" onClick={async () => { await onRequest(); toast.success('Demande de visite envoyée !'); }} disabled={isLoading}>
        Demander une visite
      </Button>
    </div>
  );
}

function ProposeDatesCard({ onPropose, isLoading }: { onPropose: (dates: { date: string; preference: number }[]) => Promise<any>; isLoading: boolean }) {
  const [dates, setDates] = useState(['', '', '']);

  const handleSubmit = async () => {
    const validDates = dates.filter(d => d).map((d, i) => ({ date: d, preference: i + 1 }));
    if (validDates.length === 0) {
      toast.error('Proposez au moins une date');
      return;
    }
    await onPropose(validDates);
    toast.success('Dates proposées !');
  };

  return (
    <div className="bg-card rounded-xl p-4 border border-border space-y-3">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        Proposer des dates de visite
      </h3>
      <p className="text-sm text-muted-foreground">Proposez jusqu'à 3 dates et horaires.</p>
      {[0, 1, 2].map(i => (
        <Input
          key={i}
          type="datetime-local"
          value={dates[i]}
          onChange={e => {
            const newDates = [...dates];
            newDates[i] = e.target.value;
            setDates(newDates);
          }}
          className="bg-background border-border"
          placeholder={`Date ${i + 1}`}
        />
      ))}
      <Button className="w-full" onClick={handleSubmit} disabled={isLoading}>
        Proposer ces dates
      </Button>
    </div>
  );
}

function ConfirmVisitCard({
  transaction, onConfirm, isBuyer, isLoading
}: { transaction: WfTransaction; onConfirm: (date: string) => Promise<any>; isBuyer: boolean; isLoading: boolean }) {
  const proposedDates = transaction.visit_proposed_dates as { date: string; preference: number }[] | null;
  const alreadyConfirmed = isBuyer ? transaction.visit_confirmed_by_buyer : transaction.visit_confirmed_by_seller;

  if (alreadyConfirmed) {
    return (
      <div className="bg-card rounded-xl p-4 border border-border">
        <p className="text-muted-foreground text-sm">
          ✅ Vous avez confirmé. En attente de l'autre participant.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border space-y-3">
      <h3 className="font-semibold text-foreground">Confirmez une date</h3>
      {proposedDates?.map((d, i) => (
        <Button
          key={i}
          variant="outline"
          className="w-full justify-start"
          onClick={async () => { await onConfirm(d.date); toast.success('Date confirmée !'); }}
          disabled={isLoading}
        >
          <Calendar className="h-4 w-4 mr-2" />
          {new Date(d.date).toLocaleDateString('fr-FR', {
            weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
          })}
          {d.preference === 1 && <span className="ml-auto text-xs text-primary">Préféré</span>}
        </Button>
      ))}
    </div>
  );
}

function CompleteVisitCard({ onComplete, isLoading }: { onComplete: (wasPresent: boolean) => Promise<any>; isLoading: boolean }) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border space-y-3">
      <h3 className="font-semibold text-foreground">La visite a-t-elle eu lieu ?</h3>
      <div className="flex gap-2">
        <Button className="flex-1" onClick={async () => { await onComplete(true); toast.success('Visite validée !'); }} disabled={isLoading}>
          <Check className="h-4 w-4 mr-2" /> Oui, visite effectuée
        </Button>
        <Button variant="outline" className="flex-1" onClick={async () => { await onComplete(false); toast.error('No-show signalé'); }} disabled={isLoading}>
          <X className="h-4 w-4 mr-2" /> Absent(e)
        </Button>
      </div>
    </div>
  );
}

function IntentionCard({ onExpress, isLoading }: { onExpress: (args: { intention: 'continue' | 'offer' | 'stop'; reason?: string }) => Promise<any>; isLoading: boolean }) {
  const [showStopReason, setShowStopReason] = useState(false);
  const [reason, setReason] = useState('');

  return (
    <div className="bg-card rounded-xl p-4 border border-border space-y-3">
      <h3 className="font-semibold text-foreground">Quelle suite souhaitez-vous donner ?</h3>

      {showStopReason ? (
        <div className="space-y-2">
          <Textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Pourquoi souhaitez-vous arrêter ?"
            className="bg-background border-border"
          />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowStopReason(false)}>Annuler</Button>
            <Button variant="destructive" className="flex-1" onClick={async () => { await onExpress({ intention: 'stop', reason }); }} disabled={isLoading}>Confirmer l'arrêt</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Button className="w-full" onClick={async () => { await onExpress({ intention: 'offer' }); toast.success('Intention enregistrée !'); }} disabled={isLoading}>
            💰 Faire une offre
          </Button>
          <Button variant="outline" className="w-full" onClick={async () => { await onExpress({ intention: 'continue' }); toast.success('Intention enregistrée !'); }} disabled={isLoading}>
            🤔 Continuer les échanges
          </Button>
          <Button variant="ghost" className="w-full text-red-400" onClick={() => setShowStopReason(true)}>
            ✋ Arrêter
          </Button>
        </div>
      )}
    </div>
  );
}

function WaitingCard({ message }: { message: string }) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-5 w-5 animate-pulse" />
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}
