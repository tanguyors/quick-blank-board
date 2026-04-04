import { useReviewsForUser, useAverageRating } from '@/hooks/useExchangeReviews';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const h = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={cn(h, s <= rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/20")} />
      ))}
    </div>
  );
}

export function ExchangeReviewsList({ userId }: { userId?: string }) {
  const { data: reviews, isLoading } = useReviewsForUser(userId);
  const avg = useAverageRating(userId);
  const { t } = useTranslation();

  if (isLoading) return null;
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">{t('exchangeReview.noReviews')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {avg && (
        <div className="flex items-center gap-3">
          <Stars rating={Math.round(avg.overall)} size="md" />
          <span className="text-sm font-semibold text-foreground">{avg.overall}/5</span>
          <span className="text-xs text-muted-foreground">({avg.count} {t('exchangeReview.reviews')})</span>
        </div>
      )}
      <div className="space-y-2">
        {reviews.map((review: any) => (
          <div key={review.id} className="bg-secondary/30 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <Stars rating={review.rating_overall} />
              <span className="text-xs text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            {review.comment && (
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            )}
            <div className="flex gap-3 text-xs text-muted-foreground/70">
              <span>{t('exchangeReview.cleanliness')}: {review.rating_cleanliness}/5</span>
              <span>{t('exchangeReview.communication')}: {review.rating_communication}/5</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
