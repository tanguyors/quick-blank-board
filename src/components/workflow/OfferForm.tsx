import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import type { WfTransaction } from '@/types/workflow';
import { useTranslation } from 'react-i18next';

interface OfferFormProps {
  transaction: WfTransaction;
  onMakeOffer: (args: { offerType: string; amount: number; details?: string }) => Promise<any>;
  isLoading: boolean;
}

export function OfferForm({ transaction, onMakeOffer, isLoading }: OfferFormProps) {
  const { t } = useTranslation();
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

  const OFFER_TYPES = [
    { value: 'asking_price', label: t('offer.atListedPrice'), description: t('offer.acceptListedPrice') },
    { value: 'negotiation', label: t('offer.negotiation'), description: t('offer.proposeAmount') },
    { value: 'upfront', label: t('offer.upfront'), description: t('offer.upfrontDesc') },
    { value: 'monthly', label: t('offer.monthly'), description: t('offer.monthlyDesc') },
  ];

  const EXCHANGE_DURATIONS = [
    { value: '1_week', label: t('offer.oneWeek') },
    { value: '2_weeks', label: t('offer.twoWeeks') },
    { value: '1_month', label: t('offer.oneMonth') },
    { value: '3_months', label: t('offer.threeMonths') },
    { value: '6_months', label: t('offer.sixMonths') },
    { value: 'flexible', label: t('offer.flexible') },
  ];

  const handleSubmit = async () => {
    if (isHomeExchange) {
      if (!exchangeDuration) {
        toast.error(t('offer.chooseExchangeDuration'));
        return;
      }
      const exchangeDetails = [
        `${t('offer.proposeExchange')} — ${t('offer.exchangeDuration')} : ${EXCHANGE_DURATIONS.find(d => d.value === exchangeDuration)?.label}`,
        exchangeCompensation ? `${t('offer.financialComplement')} : ${exchangeCompensation} ${preferredCurrency}` : null,
        details || null,
      ].filter(Boolean).join('\n');

      await onMakeOffer({
        offerType: 'home_exchange',
        amount: Number(exchangeCompensation) || 0,
        details: exchangeDetails,
      });
      toast.success(t('offer.exchangeProposalSent'));
      return;
    }

    if (!offerType) {
      toast.error(t('offer.chooseOfferType'));
      return;
    }
    const finalAmount = offerType === 'asking_price' ? askingPrice : Number(amount);
    if (!finalAmount || finalAmount <= 0) {
      toast.error(t('offer.invalidAmount'));
      return;
    }
    await onMakeOffer({ offerType, amount: finalAmount, details: details || undefined });
    toast.success(t('offer.offerSent'));
  };

  // Home Exchange mode
  if (isHomeExchange) {
    return (
      <div className="bg-card rounded-xl p-4 border border-border space-y-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-cyan-400" />
          <h3 className="font-semibold text-foreground">{t('offer.proposeExchange')}</h3>
        </div>

        <p className="text-sm text-muted-foreground">
          {t('offer.exchangeDesc')}
        </p>

        {/* Exchange duration */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t('offer.exchangeDuration')} *</label>
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
          <label className="text-sm font-medium text-foreground">{t('offer.financialComplement')}</label>
          <p className="text-xs text-muted-foreground">
            {t('offer.complementDesc')}
          </p>
          <Input
            type="number"
            value={exchangeCompensation}
            onChange={e => setExchangeCompensation(e.target.value)}
            placeholder={t('offer.amountOptional')}
            className="bg-secondary/30 border-border"
          />
        </div>

        {/* Details */}
        <Textarea
          value={details}
          onChange={e => setDetails(e.target.value)}
          placeholder={t('offer.conditionsPlaceholder')}
          rows={3}
          className="bg-secondary/30 border-border"
        />

        <Button className="w-full" onClick={handleSubmit} disabled={isLoading || !exchangeDuration}>
          {isLoading ? t('offer.sending') : t('offer.sendExchangeProposal')}
        </Button>
      </div>
    );
  }

  // Standard offer mode
  return (
    <div className="bg-card rounded-xl p-4 border border-border space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">{t('offer.makeOffer')}</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        {t('offer.listedPrice')} : <span className="text-foreground font-bold">{displayPrice(askingPrice, currency)}</span>
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
          <label className="text-sm text-muted-foreground">{t('offer.amount')} ({preferredCurrency})</label>
          <Input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder={t('offer.enterAmount')}
            className="bg-secondary/30 border-border"
          />
        </div>
      )}

      {/* Details */}
      <Textarea
        value={details}
        onChange={e => setDetails(e.target.value)}
        placeholder={t('offer.commentsPlaceholder')}
        rows={2}
        className="bg-secondary/30 border-border"
      />

      <Button className="w-full" onClick={handleSubmit} disabled={isLoading || !offerType}>
        {isLoading ? t('offer.sending') : t('offer.sendOffer')}
      </Button>
    </div>
  );
}
