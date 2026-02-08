import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import type { WfTransaction } from '@/types/workflow';

interface OfferFormProps {
  transaction: WfTransaction;
  onMakeOffer: (args: { offerType: string; amount: number; details?: string }) => Promise<any>;
  isLoading: boolean;
}

const OFFER_TYPES = [
  { value: 'asking_price', label: 'Au prix affiché', description: 'Accepter le prix demandé' },
  { value: 'negotiation', label: 'Négociation', description: 'Proposer un autre montant' },
  { value: 'upfront', label: 'Paiement initial (location)', description: 'Paiement anticipé pour location' },
  { value: 'monthly', label: 'Mensuel (location)', description: 'Offre de loyer mensuel' },
];

export function OfferForm({ transaction, onMakeOffer, isLoading }: OfferFormProps) {
  const [offerType, setOfferType] = useState('');
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState('');
  const { displayPrice, preferredCurrency } = useDisplayPrice();

  const property = transaction.properties;
  const askingPrice = property?.prix || 0;
  const currency = property?.prix_currency || 'XOF';

  const handleSubmit = async () => {
    if (!offerType) {
      toast.error('Choisissez un type d\'offre');
      return;
    }
    const finalAmount = offerType === 'asking_price' ? askingPrice : Number(amount);
    if (!finalAmount || finalAmount <= 0) {
      toast.error('Montant invalide');
      return;
    }
    await onMakeOffer({ offerType, amount: finalAmount, details: details || undefined });
    toast.success('Offre envoyée !');
  };

  return (
    <div className="bg-card rounded-xl p-4 border border-border space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Faire une offre</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Prix affiché : <span className="text-foreground font-bold">{displayPrice(askingPrice, currency)}</span>
      </p>

      {/* Offer type selection */}
      <div className="space-y-2">
        {OFFER_TYPES.map(type => (
          <button
            key={type.value}
            type="button"
            onClick={() => {
              setOfferType(type.value);
              if (type.value === 'asking_price') setAmount(String(askingPrice));
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
              offerType === type.value
                ? 'border-primary bg-primary/10'
                : 'border-border bg-secondary/30'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              offerType === type.value ? 'border-primary' : 'border-muted-foreground'
            }`}>
              {offerType === type.value && <div className="w-2 h-2 rounded-full bg-primary" />}
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">{type.label}</p>
              <p className="text-xs text-muted-foreground">{type.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Amount input - shown for non-asking-price offers */}
      {offerType && offerType !== 'asking_price' && (
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Montant ({preferredCurrency})</label>
          <Input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Saisissez votre montant"
            className="bg-secondary/30 border-border"
          />
        </div>
      )}

      {/* Details */}
      <Textarea
        value={details}
        onChange={e => setDetails(e.target.value)}
        placeholder="Commentaires ou conditions (optionnel)"
        rows={2}
        className="bg-secondary/30 border-border"
      />

      <Button className="w-full" onClick={handleSubmit} disabled={isLoading || !offerType}>
        {isLoading ? 'Envoi...' : 'Envoyer l\'offre'}
      </Button>
    </div>
  );
}