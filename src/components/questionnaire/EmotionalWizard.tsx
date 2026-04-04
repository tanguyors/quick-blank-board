import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Question } from '@/lib/propertyQuestions';

interface EmotionalWizardProps {
  questions: Question[];
  initialValues?: Record<string, string | string[]>;
  onComplete: (answers: Record<string, string | string[]>) => Promise<void>;
  title: string;
  subtitle?: string;
}

function Chip({ selected, onClick, children, emoji }: { selected: boolean; onClick: () => void; children: React.ReactNode; emoji?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all w-full text-left active:scale-[0.98]",
        selected
          ? "bg-primary/10 text-primary border-primary"
          : "bg-card text-foreground border-border hover:border-primary/30"
      )}
    >
      {emoji && <span className="text-lg">{emoji}</span>}
      <span className="flex-1">{children}</span>
      {selected && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
    </button>
  );
}

export function EmotionalWizard({ questions, initialValues, onComplete, title, subtitle }: EmotionalWizardProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(initialValues || {});
  const [otherValues, setOtherValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const totalSteps = questions.length;
  const question = questions[step];
  const progress = ((step + 1) / totalSteps) * 100;

  const currentAnswer = answers[question?.id];

  const handleSelect = (value: string) => {
    if (!question) return;
    if (question.type === 'single') {
      setAnswers(prev => ({ ...prev, [question.id]: value }));
    } else {
      const arr = (currentAnswer as string[]) || [];
      if (arr.includes(value)) {
        setAnswers(prev => ({ ...prev, [question.id]: arr.filter(v => v !== value) }));
      } else {
        if (question.maxSelect && arr.length >= question.maxSelect) return;
        setAnswers(prev => ({ ...prev, [question.id]: [...arr, value] }));
      }
    }
  };

  const handleOther = (value: string) => {
    setOtherValues(prev => ({ ...prev, [question.id]: value }));
    if (question.type === 'single') {
      setAnswers(prev => ({ ...prev, [question.id]: `other:${value}` }));
    }
  };

  const isSelected = (value: string) => {
    if (!currentAnswer) return false;
    if (question.type === 'single') return currentAnswer === value;
    return (currentAnswer as string[]).includes(value);
  };

  const canNext = () => {
    if (!currentAnswer) return false;
    if (Array.isArray(currentAnswer)) return currentAnswer.length > 0;
    return currentAnswer.length > 0;
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Merge "other" values into answers
      const finalAnswers = { ...answers };
      for (const [qId, otherVal] of Object.entries(otherValues)) {
        if (otherVal && typeof finalAnswers[qId] === 'string' && finalAnswers[qId]?.startsWith('other:')) {
          finalAnswers[qId] = `other:${otherVal}`;
        }
      }
      await onComplete(finalAnswers);
      setDone(true);
    } catch {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Heart className="h-8 w-8 text-primary fill-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Profil complété !</h2>
        <p className="text-sm text-muted-foreground">Vos réponses ont été enregistrées et contribueront au matching intelligent.</p>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Progress bar */}
      <div className="px-4 pt-2 pb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground">{step + 1}/{totalSteps}</p>
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-4 space-y-4 overflow-y-auto pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{question.title}</h2>
          {question.subtitle && <p className="text-sm text-muted-foreground mt-1">{question.subtitle}</p>}
          {question.type === 'multi' && question.maxSelect && (
            <p className="text-xs text-primary mt-1">Max {question.maxSelect} choix</p>
          )}
        </div>

        <div className="space-y-2">
          {question.options.map(opt => (
            <Chip
              key={opt.value}
              selected={isSelected(opt.value)}
              onClick={() => handleSelect(opt.value)}
              emoji={opt.emoji}
            >
              {opt.label}
            </Chip>
          ))}

          {question.hasOther && (
            <div className="pt-1">
              <Input
                placeholder="Autre (précisez)..."
                value={otherValues[question.id] || ''}
                onChange={e => handleOther(e.target.value)}
                className={cn(
                  "bg-card border-border",
                  typeof currentAnswer === 'string' && currentAnswer.startsWith('other:') && "border-primary"
                )}
                onFocus={() => {
                  if (question.type === 'single') {
                    setAnswers(prev => ({ ...prev, [question.id]: `other:${otherValues[question.id] || ''}` }));
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer nav */}
      <div className="flex items-center gap-3 px-4 py-4 border-t border-border bg-background">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={step === 0}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        {step < totalSteps - 1 ? (
          <Button
            size="sm"
            onClick={handleNext}
            disabled={!canNext()}
            className="gap-1"
          >
            Suivant <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleFinish}
            disabled={!canNext() || saving}
            className="gap-1"
          >
            {saving ? 'Enregistrement...' : 'Terminer'} <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
