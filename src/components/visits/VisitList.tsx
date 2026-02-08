import { useVisits } from '@/hooks/useVisits';
import { useAuth } from '@/hooks/useAuth';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import { VisitStatusBadge } from './VisitStatusBadge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { Check, X, CalendarDays, MapPin } from 'lucide-react';

export function VisitList() {
  const { visits, updateVisitStatus } = useVisits();
  const { user, roles } = useAuth();
  const { displayPrice } = useDisplayPrice();
  const isOwner = roles.includes('owner');

  if (visits.isLoading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (!visits.data?.length) return (
    <div className="text-center p-8">
      <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
      <p className="text-muted-foreground">Aucune visite</p>
      <p className="text-xs text-muted-foreground/60 mt-1">
        {isOwner ? 'Les demandes de visite apparaîtront ici.' : 'Demandez une visite depuis un bien matché.'}
      </p>
    </div>
  );

  return (
    <div className="p-4 space-y-3 max-w-lg mx-auto">
      {visits.data.map(visit => {
        const property = (visit as any).properties;
        return (
          <div key={visit.id} className="bg-card border border-border rounded-xl p-4">
            {/* Property + status */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm capitalize truncate">
                  {property?.type || 'Bien'}
                </p>
                <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="text-xs truncate">{property?.adresse}</span>
                </div>
                {property?.prix && (
                  <p className="text-xs font-medium text-primary mt-1">
                    {displayPrice(property.prix, property.prix_currency)}
                  </p>
                )}
              </div>
              <VisitStatusBadge status={visit.status} />
            </div>

            {/* Date */}
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="text-xs">
                {format(new Date(visit.proposed_date), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </span>
            </div>

            {/* Message */}
            {visit.message && (
              <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2 mb-3">
                💬 {visit.message}
              </p>
            )}

            {/* Cancel reason */}
            {visit.cancel_reason && (
              <p className="text-xs text-destructive bg-destructive/5 rounded-lg p-2 mb-3">
                Raison : {visit.cancel_reason}
              </p>
            )}

            {/* Owner actions */}
            {isOwner && visit.status === 'pending' && visit.owner_id === user?.id && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => updateVisitStatus.mutate({ id: visit.id, status: 'confirmed' })}
                >
                  <Check className="h-4 w-4 mr-1" /> Accepter
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    const reason = prompt("Raison du refus (optionnel) :");
                    updateVisitStatus.mutate({ id: visit.id, status: 'cancelled', cancel_reason: reason || undefined });
                  }}
                >
                  <X className="h-4 w-4 mr-1" /> Refuser
                </Button>
              </div>
            )}

            {/* Buyer cancel action */}
            {!isOwner && visit.status === 'pending' && visit.buyer_id === user?.id && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateVisitStatus.mutate({ id: visit.id, status: 'cancelled' })}
              >
                <X className="h-4 w-4 mr-1" /> Annuler ma demande
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
