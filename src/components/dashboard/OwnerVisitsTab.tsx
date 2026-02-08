import { useVisits } from '@/hooks/useVisits';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { Check, X, CalendarDays } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente', confirmed: 'Confirmée', cancelled: 'Annulée', completed: 'Terminée',
};

export function OwnerVisitsTab() {
  const { visits, updateVisitStatus } = useVisits();
  const { user } = useAuth();

  if (visits.isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!visits.data?.length) {
    return (
      <div className="p-4">
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <CalendarDays className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">Visites programmées</h3>
          <p className="text-muted-foreground text-sm">Les demandes de visite pour vos biens apparaîtront ici</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {visits.data.map(visit => (
        <Card key={visit.id} className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-medium">{(visit as any).properties?.adresse}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(visit.proposed_date), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </p>
            </div>
            <Badge className={STATUS_COLORS[visit.status]}>{STATUS_LABELS[visit.status]}</Badge>
          </div>
          {visit.message && <p className="text-sm text-muted-foreground mb-3">{visit.message}</p>}
          {visit.cancel_reason && <p className="text-sm text-destructive mb-3">Raison: {visit.cancel_reason}</p>}
          {visit.status === 'pending' && visit.owner_id === user?.id && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => updateVisitStatus.mutate({ id: visit.id, status: 'confirmed' })}>
                <Check className="h-4 w-4 mr-1" /> Confirmer
              </Button>
              <Button size="sm" variant="destructive" onClick={() => {
                const reason = prompt("Raison de l'annulation (optionnel):");
                updateVisitStatus.mutate({ id: visit.id, status: 'cancelled', cancel_reason: reason || undefined });
              }}>
                <X className="h-4 w-4 mr-1" /> Annuler
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
