import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { AvatarUpload } from './AvatarUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function ProfileForm() {
  const { roles, refreshProfile } = useAuth();
  const { profile, updateProfile } = useProfile();
  const [form, setForm] = useState({
    first_name: '', last_name: '', full_name: '', bio: '',
    whatsapp: '', avatar_url: '', company_name: '', company_address: '',
  });

  useEffect(() => {
    if (profile.data) {
      setForm({
        first_name: profile.data.first_name || '',
        last_name: profile.data.last_name || '',
        full_name: profile.data.full_name || '',
        bio: profile.data.bio || '',
        whatsapp: profile.data.whatsapp || '',
        avatar_url: profile.data.avatar_url || '',
        company_name: profile.data.company_name || '',
        company_address: profile.data.company_address || '',
      });
    }
  }, [profile.data]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(form);
      await refreshProfile();
      toast.success('Profil mis à jour');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const isOwner = roles.includes('owner');

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <AvatarUpload url={form.avatar_url} onUpload={url => setForm(f => ({ ...f, avatar_url: url }))} />
      <div className="flex justify-center gap-2">
        {roles.map(role => <Badge key={role} variant="secondary">{role}</Badge>)}
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Prénom</Label><Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></div>
          <div><Label>Nom</Label><Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></div>
        </div>
        <div><Label>Nom complet</Label><Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} /></div>
        <div><Label>Bio</Label><Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} /></div>
        <div><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="+225..." /></div>
        {isOwner && (
          <>
            <div><Label>Nom de l'entreprise</Label><Input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} /></div>
            <div><Label>Adresse de l'entreprise</Label><Input value={form.company_address} onChange={e => setForm(f => ({ ...f, company_address: e.target.value }))} /></div>
          </>
        )}
      </div>
      <Button className="w-full" onClick={handleSave} disabled={updateProfile.isPending}>
        {updateProfile.isPending ? 'Enregistrement...' : 'Enregistrer'}
      </Button>
    </div>
  );
}
