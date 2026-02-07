import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function ProfileSetup() {
  const { user, roles, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const isOwner = roles.includes('owner');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    full_name: '',
    whatsapp: '',
    bio: '',
    avatar_url: '',
    company_name: '',
    company_address: '',
  });

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const fullName = form.full_name || `${form.first_name} ${form.last_name}`.trim();
      const { error } = await supabase
        .from('profiles')
        .update({
          ...form,
          full_name: fullName,
        })
        .eq('id', user.id);
      if (error) throw error;

      await refreshProfile();
      toast.success('Profil configuré !');
      navigate(isOwner ? '/dashboard' : '/explore');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center px-4 py-4">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="flex-1 text-center font-semibold text-lg text-foreground">Configurez votre profil</span>
        <div className="w-8" />
      </div>

      <div className="flex-1 px-6 py-6 max-w-sm mx-auto w-full space-y-5">
        {/* Avatar */}
        <div className="flex justify-center">
          <AvatarUpload
            url={form.avatar_url}
            onUpload={url => setForm(f => ({ ...f, avatar_url: url }))}
          />
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <Input
            placeholder="Prénom"
            value={form.first_name}
            onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
            className="h-14 bg-card border-border rounded-xl"
          />
          <Input
            placeholder="Nom"
            value={form.last_name}
            onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
            className="h-14 bg-card border-border rounded-xl"
          />
          <Input
            placeholder="Numéro WhatsApp (+62...)"
            value={form.whatsapp}
            onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
            className="h-14 bg-card border-border rounded-xl"
          />
          <Textarea
            placeholder="Parlez-nous de vous..."
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            rows={3}
            className="bg-card border-border rounded-xl"
          />
          {isOwner && (
            <>
              <Input
                placeholder="Nom de l'entreprise"
                value={form.company_name}
                onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                className="h-14 bg-card border-border rounded-xl"
              />
              <Input
                placeholder="Adresse de l'entreprise"
                value={form.company_address}
                onChange={e => setForm(f => ({ ...f, company_address: e.target.value }))}
                className="h-14 bg-card border-border rounded-xl"
              />
            </>
          )}
        </div>

        <Button
          className="w-full h-14 rounded-xl text-base font-semibold"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Enregistrement...' : 'Terminer'}
        </Button>

        <button
          onClick={() => navigate(isOwner ? '/dashboard' : '/explore')}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Passer cette étape
        </button>
      </div>
    </div>
  );
}
