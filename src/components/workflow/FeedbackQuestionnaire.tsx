import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface FeedbackQuestionnaireProps {
  onSubmit: (feedback: Record<string, any>) => Promise<any>;
  isLoading: boolean;
  alreadySubmitted?: boolean;
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`h-7 w-7 ${
              star <= value
                ? 'text-amber-400 fill-amber-400'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function FeedbackQuestionnaire({ onSubmit, isLoading, alreadySubmitted = false }: FeedbackQuestionnaireProps) {
  const { t } = useTranslation();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(alreadySubmitted);

  const QUESTIONS = [
    { key: 'overall', label: t('feedback.overallRating') },
    { key: 'ease_of_use', label: t('feedback.easeOfUse') },
    { key: 'communication', label: t('feedback.communication') },
    { key: 'security', label: t('feedback.securityFeeling') },
    { key: 'recommendation', label: t('feedback.recommend') },
  ];

  const handleSubmit = async () => {
    const unanswered = QUESTIONS.filter(q => !ratings[q.key]);
    if (unanswered.length > 0) {
      toast.error(t('feedback.answerAll'));
      return;
    }
    await onSubmit({ ratings, comment });
    setSubmitted(true);
    toast.success(t('feedback.thankYouToast'));
  };

  if (submitted) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border text-center space-y-3">
        <div className="text-4xl">🙏</div>
        <h3 className="font-bold text-foreground">{t('feedback.thankYou')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('feedback.thankYouDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border space-y-5">
      <h3 className="font-semibold text-foreground text-center">
        {t('feedback.howWasExperience')}
      </h3>

      {QUESTIONS.map(q => (
        <div key={q.key} className="space-y-1">
          <label className="text-sm text-muted-foreground">{q.label}</label>
          <StarRating
            value={ratings[q.key] || 0}
            onChange={v => setRatings(prev => ({ ...prev, [q.key]: v }))}
          />
        </div>
      ))}

      <div className="space-y-1">
        <label className="text-sm text-muted-foreground">{t('feedback.commentsOptional')}</label>
        <Textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder={t('feedback.sharePlaceholder')}
          rows={3}
          className="bg-secondary/30 border-border"
        />
      </div>

      <Button className="w-full" onClick={handleSubmit} disabled={isLoading}>
        <Send className="h-4 w-4 mr-2" />
        {t('feedback.submit')}
      </Button>
    </div>
  );
}
