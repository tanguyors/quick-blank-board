import { TransactionStatus as TxStatus, STATUS_LABELS, STATUS_COLORS } from '@/types/workflow';
import { Check, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

interface TransactionStatusBadgeProps {
  status: TxStatus;
}

export function TransactionStatusBadge({ status }: TransactionStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

const TIMELINE_STEPS: { status: TxStatus; label: string }[] = [
  { status: 'matched', label: 'Match' },
  { status: 'visit_requested', label: 'Visite demandée' },
  { status: 'visit_confirmed', label: 'Visite confirmée' },
  { status: 'visit_completed', label: 'Visite effectuée' },
  { status: 'intention_expressed', label: 'Intention' },
  { status: 'offer_made', label: 'Offre' },
  { status: 'documents_generated', label: 'Documents' },
  { status: 'deal_finalized', label: 'Finalisé' },
];

const STATUS_ORDER: TxStatus[] = [
  'matched', 'visit_requested', 'visit_proposed', 'visit_confirmed',
  'visit_completed', 'intention_expressed', 'offer_made',
  'documents_generated', 'in_validation', 'deal_finalized',
];

interface TransactionTimelineProps {
  currentStatus: TxStatus;
  logs?: { action: string; created_at: string; new_status: string | null }[];
}

export function TransactionTimeline({ currentStatus, logs }: TransactionTimelineProps) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const isCancelled = currentStatus === 'deal_cancelled' || currentStatus === 'visit_cancelled' || currentStatus === 'archived';

  return (
    <div className="space-y-0">
      {TIMELINE_STEPS.map((step, i) => {
        const stepIdx = STATUS_ORDER.indexOf(step.status);
        const isCompleted = !isCancelled && stepIdx <= currentIdx && stepIdx >= 0;
        const isCurrent = step.status === currentStatus;
        const log = logs?.find(l => l.new_status === step.status);

        return (
          <div key={step.status} className="flex items-start gap-3">
            {/* Dot + line */}
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                isCurrent
                  ? 'bg-primary text-primary-foreground'
                  : isCompleted
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-secondary text-muted-foreground'
              }`}>
                {isCompleted && !isCurrent ? (
                  <Check className="h-3 w-3" />
                ) : isCurrent ? (
                  <Clock className="h-3 w-3" />
                ) : (
                  <span className="w-2 h-2 bg-current rounded-full opacity-30" />
                )}
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div className={`w-0.5 h-8 ${isCompleted ? 'bg-green-500/30' : 'bg-border'}`} />
              )}
            </div>

            {/* Label */}
            <div className="pb-6">
              <p className={`text-sm font-medium ${isCurrent ? 'text-foreground' : isCompleted ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
                {step.label}
              </p>
              {log && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {isCancelled && (
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <X className="h-3 w-3 text-red-400" />
          </div>
          <p className="text-sm font-medium text-red-400">{STATUS_LABELS[currentStatus]}</p>
        </div>
      )}
    </div>
  );
}
