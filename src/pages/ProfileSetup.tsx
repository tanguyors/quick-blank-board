import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { PublicNavBar } from '@/components/layout/PublicNavBar';

export default function ProfileSetup() {
  const { user, roles, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    nationality: '',
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
          nationality: form.nationality || null,
        } as any)
        .eq('id', user.id);
      if (error) throw error;

      await refreshProfile();
      toast.success(t('profile.configured'));
      navigate(isOwner ? '/dashboard' : '/explore');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavBar title={t('profile.setupTitle')} onBack={() => navigate(-1)} />

      <div className="flex-1 px-6 py-6 max-w-sm mx-auto w-full space-y-5">
        <div className="flex justify-center">
          <AvatarUpload
            url={form.avatar_url}
            onUpload={url => setForm(f => ({ ...f, avatar_url: url }))}
          />
        </div>

        <div className="space-y-3">
          <Input
            placeholder={t('profile.firstName')}
            value={form.first_name}
            onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
            className="h-14 bg-card border-border rounded-xl"
          />
          <Input
            placeholder={t('profile.lastName')}
            value={form.last_name}
            onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
            className="h-14 bg-card border-border rounded-xl"
          />
          <Input
            placeholder={t('profile.whatsapp')}
            value={form.whatsapp}
            onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
            className="h-14 bg-card border-border rounded-xl"
          />
          <Textarea
            placeholder={t('profile.bio')}
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            rows={3}
            className="bg-card border-border rounded-xl"
          />
          {isOwner && (
            <>
              <Input
                placeholder={t('profile.companyName')}
                value={form.company_name}
                onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                className="h-14 bg-card border-border rounded-xl"
              />
              <Input
                placeholder={t('profile.companyAddress')}
                value={form.company_address}
                onChange={e => setForm(f => ({ ...f, company_address: e.target.value }))}
                className="h-14 bg-card border-border rounded-xl"
              />
              <Input
                placeholder={t('profile.nationalityPlaceholder')}
                value={form.nationality}
                onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
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
          {loading ? t('profile.saving') : t('profile.finish')}
        </Button>

        <button
          onClick={() => navigate(isOwner ? '/dashboard' : '/explore')}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('profile.skipStep')}
        </button>
      </div>
    </div>
  );
}
