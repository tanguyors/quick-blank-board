import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { User, Home, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSelection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'user' | 'owner'>('user');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Check if role already assigned
      const { data: existing } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (!existing?.length) {
        await supabase.from('user_roles').insert({ user_id: user.id, role: selectedRole });
      }

      // Initialize user score
      const { data: existingScore } = await supabase
        .from('wf_user_scores')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingScore) {
        await supabase.from('wf_user_scores').insert({ user_id: user.id });
      }

      toast.success('Rôle sélectionné !');
      navigate('/profile-setup');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="flex-1 text-center font-semibold text-lg text-foreground">Choisissez votre profil</span>
        <div className="w-8" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
            <span className="text-primary text-4xl font-bold">𝔫</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Bienvenue !</h1>
          <p className="text-muted-foreground mt-1 text-center">Comment souhaitez-vous utiliser SomaGate ?</p>
        </div>

        <div className="w-full max-w-sm space-y-3">
          <button
            type="button"
            onClick={() => setSelectedRole('user')}
            className={`w-full flex items-center gap-4 p-5 rounded-xl border transition-all ${
              selectedRole === 'user' ? 'border-primary bg-primary/10' : 'border-border bg-card'
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
              selectedRole === 'user' ? 'bg-primary/20' : 'bg-secondary'
            }`}>
              <User className={`h-7 w-7 ${selectedRole === 'user' ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-foreground text-lg">Acheteur / Locataire</p>
              <p className="text-sm text-muted-foreground">Je cherche un bien immobilier</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              selectedRole === 'user' ? 'border-primary' : 'border-muted-foreground'
            }`}>
              {selectedRole === 'user' && <div className="w-3.5 h-3.5 rounded-full bg-primary" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('owner')}
            className={`w-full flex items-center gap-4 p-5 rounded-xl border transition-all ${
              selectedRole === 'owner' ? 'border-primary bg-primary/10' : 'border-border bg-card'
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
              selectedRole === 'owner' ? 'bg-primary/20' : 'bg-secondary'
            }`}>
              <Home className={`h-7 w-7 ${selectedRole === 'owner' ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-foreground text-lg">Vendeur / Bailleur</p>
              <p className="text-sm text-muted-foreground">Je propose des biens immobiliers</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              selectedRole === 'owner' ? 'border-primary' : 'border-muted-foreground'
            }`}>
              {selectedRole === 'owner' && <div className="w-3.5 h-3.5 rounded-full bg-primary" />}
            </div>
          </button>

          <Button
            className="w-full h-14 rounded-xl text-base font-semibold mt-6"
            onClick={handleContinue}
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Continuer'}
          </Button>
        </div>
      </div>
    </div>
  );
}
