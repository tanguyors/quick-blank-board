import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubmitExchangeReview } from '@/hooks/useExchangeReviews';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  transactionId?: string;
  reviewerId: string;
  revieweeId: string;
  propertyId: string;
  onSuccess?: () => void;
}

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(s => (
          <button key={s} type="button" onClick={() => onChange(s)} className="p-0.5">
            <Star className={cn("h-5 w-5 transition-colors", s <= value ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30")} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ExchangeReviewForm({ transactionId, reviewerId, revieweeId, propertyId, onSuccess }: Props) {
  const { t } = useTranslation();
  const submit = useSubmitExchangeReview();
  const [ratings, setRatings] = useState({ overall: 0, cleanliness: 0, communication: 0, propertyRespect: 0 });
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    if (ratings.overall === 0 || ratings.cleanliness === 0 || ratings.communication === 0 || ratings.propertyRespect === 0) {
      toast.error('Veuillez noter tous les critères');
      return;
    }
    try {
      await submit.mutateAsync({
        exchange_transaction_id: transactionId,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        property_id: propertyId,
        rating_overall: ratings.overall,
        rating_cleanliness: ratings.cleanliness,
        rating_communication: ratings.communication,
        rating_property_respect: ratings.propertyRespect,
        comment: comment || undefined,
      });
      toast.success(t('exchangeReview.thankYou'));
      onSuccess?.();
    } catch {
      toast.error('Erreur lors de l\'envoi');
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4">
      <h3 className="font-semibold text-foreground">{t('exchangeReview.title')}</h3>
      <div className="space-y-3">
        <StarRating label={t('exchangeReview.overall')} value={ratings.overall} onChange={v => setRatings(r => ({ ...r, overall: v }))} />
        <StarRating label={t('exchangeReview.cleanliness')} value={ratings.cleanliness} onChange={v => setRatings(r => ({ ...r, cleanliness: v }))} />
        <StarRating label={t('exchangeReview.communication')} value={ratings.communication} onChange={v => setRatings(r => ({ ...r, communication: v }))} />
        <StarRating label={t('exchangeReview.propertyRespect')} value={ratings.propertyRespect} onChange={v => setRatings(r => ({ ...r, propertyRespect: v }))} />
      </div>
      <Textarea
        placeholder={t('exchangeReview.commentPlaceholder')}
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={3}
        className="bg-secondary/50 border-border"
      />
      <Button onClick={handleSubmit} disabled={submit.isPending} className="w-full gap-2">
        <Send className="h-4 w-4" />
        {t('exchangeReview.submit')}
      </Button>
    </div>
  );
}
