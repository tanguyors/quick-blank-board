import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackQuestionnaireProps {
  onSubmit: (feedback: Record<string, any>) => Promise<any>;
  isLoading: boolean;
}

const QUESTIONS = [
  { key: 'overall', label: 'Note globale' },
  { key: 'ease_of_use', label: 'Facilité d\'utilisation' },
  { key: 'communication', label: 'Qualité de communication' },
  { key: 'security', label: 'Sentiment de sécurité' },
  { key: 'recommendation', label: 'Recommanderiez-vous SomaGate ?' },
];

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

export function FeedbackQuestionnaire({ onSubmit, isLoading }: FeedbackQuestionnaireProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const unanswered = QUESTIONS.filter(q => !ratings[q.key]);
    if (unanswered.length > 0) {
      toast.error('Veuillez répondre à toutes les questions');
      return;
    }
    await onSubmit({ ratings, comment });
    setSubmitted(true);
    toast.success('Merci pour votre retour ! 🙏');
  };

  if (submitted) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border text-center space-y-3">
        <div className="text-4xl">🙏</div>
        <h3 className="font-bold text-foreground">Merci pour votre retour !</h3>
        <p className="text-sm text-muted-foreground">
          Votre avis nous aide à améliorer SomaGate pour tous les utilisateurs.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border space-y-5">
      <h3 className="font-semibold text-foreground text-center">
        Comment s'est passée votre expérience ?
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
        <label className="text-sm text-muted-foreground">Commentaires (optionnel)</label>
        <Textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Partagez votre expérience..."
          rows={3}
          className="bg-secondary/30 border-border"
        />
      </div>

      <Button className="w-full" onClick={handleSubmit} disabled={isLoading}>
        <Send className="h-4 w-4 mr-2" />
        Envoyer mon avis
      </Button>
    </div>
  );
}