import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, X, Check, AlertTriangle, RotateCcw } from 'lucide-react';
import { SecurityBanner } from './SecurityAlert';
import type { TransactionStatus, WfTransaction } from '@/types/workflow';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface VisitManagementProps {
  transaction: WfTransaction;
  onRequestVisit: () => Promise<any>;
  onProposeVisitDates: (dates: { date: string; preference: number }[]) => Promise<any>;
  onRefuseVisit: (reason: string, details?: string) => Promise<any>;
  onConfirmVisit: (date: string) => Promise<any>;
  onCompleteVisit: (wasPresent: boolean) => Promise<any>;
  onRescheduleVisit: () => Promise<any>;
  onExpressIntention: (args: { intention: 'continue' | 'offer' | 'stop'; reason?: string; details?: string }) => Promise<any>;
  isLoading: boolean;
}

export function VisitManagement({
  transaction,
  onRequestVisit,
  onProposeVisitDates,
  onRefuseVisit,
  onConfirmVisit,
  onCompleteVisit,
  onRescheduleVisit,
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

      {/* Propose dates OR refuse - seller only when visit_requested */}
      {status === 'visit_requested' && isSeller && (
        <ProposeDatesCard
          onPropose={onProposeVisitDates}
          onRefuse={onRefuseVisit}
          isLoading={isLoading}
        />
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

      {/* Visit confirmed - waiting for visit + reschedule option */}
      {status === 'visit_confirmed' && (
        <VisitConfirmedCard
          transaction={transaction}
          onComplete={onCompleteVisit}
          onReschedule={onRescheduleVisit}
          isLoading={isLoading}
        />
      )}

      {/* Express intention after visit */}
      {status === 'visit_completed' && isBuyer && (
        <IntentionCard onExpress={onExpressIntention} isLoading={isLoading} />
      )}

      {status === 'visit_completed' && isSeller && (
        <WaitingCard message="En attente de la décision de l'acheteur après la visite." />
      )}

      {/* Rescheduled - seller proposes new dates */}
      {status === 'visit_rescheduled' && isSeller && (
        <ProposeDatesCard
          onPropose={onProposeVisitDates}
          onRefuse={onRefuseVisit}
          isLoading={isLoading}
          isReschedule
        />
      )}

      {status === 'visit_rescheduled' && isBuyer && (
        <WaitingCard message="La visite a été reportée. En attente de nouvelles dates du propriétaire." />
      )}

      {/* Cancelled */}
      {status === 'visit_cancelled' && (
        <div className="bg-card rounded-xl p-4 border border-destructive/30">
          <p className="text-destructive font-medium">Visite annulée</p>
          {transaction.visit_refusal_reason && (
            <p className="text-muted-foreground text-sm mt-2">Raison : {transaction.visit_refusal_reason}</p>
          )}
          {transaction.visit_refusal_details && (
            <p className="text-muted-foreground text-sm mt-1">{transaction.visit_refusal_details}</p>
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

// ── Request Visit ──────────────────────────────────────────────────────────────

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

// ── Propose Dates + Refuse Visit ──────────────────────────────────────────────

const REFUSAL_REASONS = [
  { value: 'unavailable', label: 'Bien non disponible' },
  { value: 'occupied', label: 'Bien occupé' },
  { value: 'unqualified', label: 'Profil insuffisamment qualifié' },
] as const;

function ProposeDatesCard({
  onPropose, onRefuse, isLoading, isReschedule = false,
}: {
  onPropose: (dates: { date: string; preference: number }[]) => Promise<any>;
  onRefuse: (reason: string, details?: string) => Promise<any>;
  isLoading: boolean;
  isReschedule?: boolean;
}) {
  const [dates, setDates] = useState(['', '', '']);
  const [showRefuse, setShowRefuse] = useState(false);
  const [refusalReason, setRefusalReason] = useState('');
  const [refusalDetails, setRefusalDetails] = useState('');

  const handleSubmit = async () => {
    const validDates = dates.filter(d => d).map((d, i) => ({ date: d, preference: i + 1 }));
    if (validDates.length === 0) {
      toast.error('Proposez au moins une date');
      return;
    }
    await onPropose(validDates);
    toast.success('Dates proposées !');
  };

  const handleRefuse = async () => {
    if (!refusalReason) {
      toast.error('Sélectionnez un motif de refus');
      return;
    }
    const reasonLabel = REFUSAL_REASONS.find(r => r.value === refusalReason)?.label || refusalReason;
    await onRefuse(reasonLabel, refusalDetails || undefined);
    toast.success('Visite refusée');
  };

  if (showRefuse) {
    return (
      <div className="bg-card rounded-xl p-4 border border-border space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Refuser la visite
        </h3>

        <SecurityBanner type="visit_refusal_warning" />

        <div className="space-y-3">
          {REFUSAL_REASONS.map(reason => (
            <label
              key={reason.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                refusalReason === reason.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/30'
              }`}
              onClick={() => setRefusalReason(reason.value)}
            >
              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                refusalReason === reason.value ? 'border-primary' : 'border-muted-foreground/40'
              }`}>
                {refusalReason === reason.value && <div className="h-2 w-2 rounded-full bg-primary" />}
              </div>
              <span className="text-sm text-foreground">{reason.label}</span>
            </label>
          ))}
        </div>

        <Textarea
          value={refusalDetails}
          onChange={e => setRefusalDetails(e.target.value)}
          placeholder="Détails supplémentaires (optionnel)"
          className="bg-background border-border"
          maxLength={500}
        />

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setShowRefuse(false)}>
            Annuler
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handleRefuse} disabled={isLoading || !refusalReason}>
            Confirmer le refus
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border space-y-3">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        {isReschedule ? 'Proposer de nouvelles dates' : 'Proposer des dates de visite'}
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
      {!isReschedule && (
        <Button variant="ghost" className="w-full text-destructive" onClick={() => setShowRefuse(true)}>
          <X className="h-4 w-4 mr-2" /> Refuser la visite
        </Button>
      )}
    </div>
  );
}

// ── Confirm Visit ─────────────────────────────────────────────────────────────

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

// ── Visit Confirmed + Complete + Reschedule ───────────────────────────────────

function VisitConfirmedCard({
  transaction, onComplete, onReschedule, isLoading,
}: {
  transaction: WfTransaction;
  onComplete: (wasPresent: boolean) => Promise<any>;
  onReschedule: () => Promise<any>;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-3">
      {/* Confirmed banner */}
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

      {/* Post-visit actions */}
      <div className="bg-card rounded-xl p-4 border border-border space-y-3">
        <h3 className="font-semibold text-foreground">La visite a-t-elle eu lieu ?</h3>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={async () => { await onComplete(true); toast.success('Visite validée !'); }} disabled={isLoading}>
            <Check className="h-4 w-4 mr-2" /> Effectuée
          </Button>
          <Button variant="outline" className="flex-1" onClick={async () => { await onComplete(false); toast.error('No-show signalé'); }} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" /> Absent(e)
          </Button>
        </div>
        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={async () => { await onReschedule(); toast.info('Visite reportée'); }}
          disabled={isLoading}
        >
          <RotateCcw className="h-4 w-4 mr-2" /> Reporter la visite
        </Button>
      </div>
    </div>
  );
}

// ── Intention Card with Structured Stop Motifs ────────────────────────────────

const STOP_MOTIFS = [
  { value: 'non_conforme_photos', label: 'Bien non conforme aux photos' },
  { value: 'pas_coup_coeur', label: 'Pas de coup de cœur' },
  { value: 'emplacement_inadapte', label: 'Emplacement non adapté' },
  { value: 'prix_inadapte', label: 'Prix ou conditions non adaptés' },
  { value: 'etat_non_conforme', label: 'État général non conforme' },
  { value: 'projet_modifie', label: 'Projet modifié' },
  { value: 'autre_bien_trouve', label: 'Autre bien trouvé' },
  { value: 'autre', label: 'Autre' },
] as const;

function IntentionCard({ onExpress, isLoading }: { onExpress: (args: { intention: 'continue' | 'offer' | 'stop'; reason?: string; details?: string }) => Promise<any>; isLoading: boolean }) {
  const [showStopMotifs, setShowStopMotifs] = useState(false);
  const [selectedMotif, setSelectedMotif] = useState('');
  const [otherDetails, setOtherDetails] = useState('');

  const handleStop = async () => {
    if (!selectedMotif) {
      toast.error('Veuillez sélectionner un motif');
      return;
    }
    const motifLabel = STOP_MOTIFS.find(m => m.value === selectedMotif)?.label || selectedMotif;
    const details = selectedMotif === 'autre' ? otherDetails : undefined;
    await onExpress({ intention: 'stop', reason: motifLabel, details });
  };

  return (
    <div className="bg-card rounded-xl p-4 border border-border space-y-3">
      <h3 className="font-semibold text-foreground">Quelle suite souhaitez-vous donner ?</h3>

      {showStopMotifs ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Pourquoi souhaitez-vous arrêter ?</p>
          <div className="space-y-2">
            {STOP_MOTIFS.map(motif => (
              <label
                key={motif.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedMotif === motif.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
                onClick={() => setSelectedMotif(motif.value)}
              >
                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                  selectedMotif === motif.value ? 'border-primary' : 'border-muted-foreground/40'
                }`}>
                  {selectedMotif === motif.value && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <span className="text-sm text-foreground">{motif.label}</span>
              </label>
            ))}
          </div>

          {selectedMotif === 'autre' && (
            <Textarea
              value={otherDetails}
              onChange={e => setOtherDetails(e.target.value)}
              placeholder="Précisez la raison..."
              className="bg-background border-border"
              maxLength={500}
            />
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => { setShowStopMotifs(false); setSelectedMotif(''); }}>
              Annuler
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleStop} disabled={isLoading || !selectedMotif}>
              Confirmer l'arrêt
            </Button>
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
          <Button variant="ghost" className="w-full text-destructive" onClick={() => setShowStopMotifs(true)}>
            ✋ Arrêter
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Waiting Card ──────────────────────────────────────────────────────────────

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
