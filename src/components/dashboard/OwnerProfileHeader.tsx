import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { Textarea } from '@/components/ui/textarea';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function OwnerProfileHeader() {
  const { profile, user } = useAuth();
  const { updateProfile } = useProfile();
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');

  const displayName = profile?.full_name || profile?.first_name || user?.email?.split('@')[0] || '';

  const handleSaveBio = async () => {
    try {
      await updateProfile.mutateAsync({ bio });
      toast.success('Description mise à jour');
      setEditingBio(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAvatarUpload = (url: string) => {
    setAvatarUrl(url);
    updateProfile.mutate({ avatar_url: url });
  };

  return (
    <div className="mx-4 mt-4 space-y-3">
      {/* Profile card */}
      <div className="bg-card rounded-2xl p-5 border border-border">
        <div className="flex items-center gap-4">
          <AvatarUpload url={avatarUrl || profile?.avatar_url} onUpload={handleAvatarUpload} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Mon Profil</p>
            <h2 className="text-xl font-bold text-foreground truncate">{displayName} 👋</h2>
            <p className="text-sm text-muted-foreground">✨ Membre SomaGate Pro</p>
          </div>
        </div>
      </div>

      {/* Activity bio */}
      <div
        className="bg-card rounded-2xl p-4 border border-border cursor-pointer"
        onClick={() => !editingBio && setEditingBio(true)}
      >
        {editingBio ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">À PROPOS DE MON ACTIVITÉ</p>
            <Textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Décrivez votre activité immobilière..."
              rows={3}
              className="bg-secondary/50 border-border resize-none text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingBio(false); setBio(profile?.bio || ''); }}>
                Annuler
              </Button>
              <Button size="sm" onClick={(e) => { e.stopPropagation(); handleSaveBio(); }}>
                Enregistrer
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">À PROPOS DE MON ACTIVITÉ</p>
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className={bio ? 'text-foreground text-sm' : 'text-muted-foreground text-sm'}>
              {bio || 'Cliquez sur le crayon pour ajouter une description de votre activité...'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
