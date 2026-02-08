import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';
import type { WfTransaction } from '@/types/workflow';
import { useAuth } from '@/hooks/useAuth';

interface DealFinalizationProps {
  transaction: WfTransaction;
  onFinalize: () => Promise<any>;
  isLoading: boolean;
}

export function DealFinalization({ transaction, onFinalize, isLoading }: DealFinalizationProps) {
  const { user } = useAuth();
  const isBuyer = user?.id === transaction.buyer_id;
  const myValidated = isBuyer ? transaction.buyer_validated : transaction.seller_validated;
  const otherValidated = isBuyer ? transaction.seller_validated : transaction.buyer_validated;

  const handleFinalize = async () => {
    await onFinalize();
    toast.success(otherValidated
      ? 'Deal finalisé ! 🎉 Félicitations !'
      : 'Votre validation a été enregistrée. En attente de l\'autre partie.'
    );
  };

  if (myValidated && otherValidated) {
    return (
      <div className="bg-card rounded-xl p-6 border border-emerald-500/30 text-center space-y-3">
        <PartyPopper className="h-12 w-12 text-emerald-400 mx-auto" />
        <h3 className="font-bold text-foreground text-lg">Deal finalisé ! 🎉</h3>
        <p className="text-muted-foreground text-sm">
          Félicitations ! Votre transaction a été finalisée avec succès.
          Vous êtes maintenant Client Certifié !
        </p>
      </div>
    );
  }

  if (myValidated) {
    return (
      <div className="bg-card rounded-xl p-4 border border-border space-y-2">
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle className="h-5 w-5" />
          <h3 className="font-semibold">Vous avez validé</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          En attente de la validation de {isBuyer ? 'du vendeur' : 'de l\'acheteur'}.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border space-y-3">
      <h3 className="font-semibold text-foreground">Finaliser le deal</h3>
      <p className="text-sm text-muted-foreground">
        Tous les documents ont été validés. Confirmez pour finaliser la transaction.
        {otherValidated && (
          <span className="block mt-1 text-emerald-400">
            ✓ L'autre partie a déjà confirmé
          </span>
        )}
      </p>
      <Button className="w-full" onClick={handleFinalize} disabled={isLoading}>
        {isLoading ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Finalisation...</>
        ) : (
          <><CheckCircle className="h-4 w-4 mr-2" /> Finaliser le deal</>
        )}
      </Button>
    </div>
  );
}