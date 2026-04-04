import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBuyerPreferences } from '@/hooks/useBuyerPreferences';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { EmotionalWizard } from '@/components/questionnaire/EmotionalWizard';
import { BUYER_QUESTIONS } from '@/lib/buyerQuestions';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function BuyerEmotionalProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { preferences } = useBuyerPreferences();

  const handleComplete = async (answers: Record<string, string | string[]>) => {
    if (!user) return;

    const existing = preferences.data;
    if (existing?.id) {
      const { error } = await (supabase as any)
        .from('buyer_preferences')
        .update({ emotional_profile: answers })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await (supabase as any)
        .from('buyer_preferences')
        .insert({ user_id: user.id, emotional_profile: answers });
      if (error) throw error;
    }

    toast.success('Profil émotionnel enregistré !');
    setTimeout(() => navigate('/profile'), 1500);
  };

  return (
    <AppLayout hideHeader>
      <PageTopBar>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="font-semibold text-foreground truncate">
            Mon profil émotionnel
          </span>
        </div>
      </PageTopBar>

      <EmotionalWizard
        questions={BUYER_QUESTIONS}
        initialValues={(preferences.data as any)?.emotional_profile || undefined}
        onComplete={handleComplete}
        title="Mon coup de cœur"
        subtitle="Je veux que mon bien me ressemble"
      />
    </AppLayout>
  );
}
