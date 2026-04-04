import { useParams, useNavigate } from 'react-router-dom';
import { useProperty } from '@/hooks/useProperties';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { EmotionalWizard } from '@/components/questionnaire/EmotionalWizard';
import { PROPERTY_QUESTIONS } from '@/lib/propertyQuestions';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function PropertyEmotionalProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: property, isLoading } = useProperty(id!);

  const handleComplete = async (answers: Record<string, string | string[]>) => {
    const { error } = await supabase
      .from('properties')
      .update({ emotional_profile: answers } as any)
      .eq('id', id!);
    if (error) throw error;
    toast.success('Profil émotionnel enregistré !');
    setTimeout(() => navigate(`/properties/${id}/edit`), 1500);
  };

  if (isLoading) {
    return (
      <AppLayout hideHeader>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout hideHeader>
      <PageTopBar>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="font-semibold text-foreground truncate">
            Personnalité du bien
          </span>
        </div>
      </PageTopBar>

      <EmotionalWizard
        questions={PROPERTY_QUESTIONS}
        initialValues={(property as any)?.emotional_profile || undefined}
        onComplete={handleComplete}
        title="Je suis une maison…"
        subtitle="Définissez la personnalité de votre bien"
      />
    </AppLayout>
  );
}
