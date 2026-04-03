import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, RefreshCw } from 'lucide-react';
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

const EXCHANGE_DURATIONS = [
  { value: '1_week', label: '1 semaine' },
  { value: '2_weeks', label: '2 semaines' },
  { value: '1_month', label: '1 mois' },
  { value: '3_months', label: '3 mois' },
  { value: '6_months', label: '6 mois' },
  { value: 'flexible', label: 'Flexible' },
];

export function OfferForm({ transaction, onMakeOffer, isLoading }: OfferFormProps) {
  const [offerType, setOfferType] = useState('');
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState('');
  const [exchangeDuration, setExchangeDuration] = useState('');
  const [exchangeCompensation, setExchangeCompensation] = useState('');
  const { displayPrice, preferredCurrency } = useDisplayPrice();

  const property = transaction.properties;
  const askingPrice = property?.prix || 0;
  const currency = property?.prix_currency || 'IDR';
  const isHomeExchange = property?.operations === 'home_exchange';

  const handleSubmit = async () => {
    if (isHomeExchange) {
      if (!exchangeDuration) {
        toast.error('Choisissez une durée d\'échange');
        return;
      }
      const exchangeDetails = [
        `Proposition d'échange — Durée : ${EXCHANGE_DURATIONS.find(d => d.value === exchangeDuration)?.label}`,
        exchangeCompensation ? `Complément financier proposé : ${exchangeCompensation} ${preferredCurrency}` : null,
        details || null,
      ].filter(Boolean).join('\n');

      await onMakeOffer({
        offerType: 'home_exchange',
        amount: Number(exchangeCompensation) || 0,
        details: exchangeDetails,
      });
      toast.success('Proposition d\'échange envoyée !');
      return;
    }

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

  // Home Exchange mode
  if (isHomeExchange) {
    return (
      <div className="bg-card rounded-xl p-4 border border-border space-y-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-cyan-400" />
          <h3 className="font-semibold text-foreground">Proposer un échange</h3>
        </div>

        <p className="text-sm text-muted-foreground">
          Proposez un échange de votre bien avec celui-ci. Convenez ensemble des modalités.
        </p>

        {/* Exchange duration */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Durée de l'échange *</label>
          <div className="grid grid-cols-3 gap-2">
            {EXCHANGE_DURATIONS.map(d => (
              <button
                key={d.value}
                type="button"
                onClick={() => setExchangeDuration(d.value)}
                className={`p-2 rounded-xl border text-sm font-medium transition-all ${
                  exchangeDuration === d.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-secondary/30 text-muted-foreground'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional compensation */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Complément financier (optionnel)</label>
          <p className="text-xs text-muted-foreground">
            Si les biens ont une valeur différente, vous pouvez proposer un ajustement.
          </p>
          <Input
            type="number"
            value={exchangeCompensation}
            onChange={e => setExchangeCompensation(e.target.value)}
            placeholder="Montant (optionnel)"
            className="bg-secondary/30 border-border"
          />
        </div>

        {/* Details */}
        <Textarea
          value={details}
          onChange={e => setDetails(e.target.value)}
          placeholder="Conditions, périodes souhaitées, détails de votre bien..."
          rows={3}
          className="bg-secondary/30 border-border"
        />

        <Button className="w-full" onClick={handleSubmit} disabled={isLoading || !exchangeDuration}>
          {isLoading ? 'Envoi...' : 'Envoyer la proposition d\'échange'}
        </Button>
      </div>
    );
  }

  // Standard offer mode
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