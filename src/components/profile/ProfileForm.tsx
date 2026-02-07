import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { AvatarUpload } from './AvatarUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Eye, Heart, CalendarDays, MessageSquare, ArrowRight, User, Pencil } from 'lucide-react';

export function ProfileForm() {
  const { roles, refreshProfile, user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const [editingBio, setEditingBio] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
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
      setEditingField(null);
      setEditingBio(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const isOwner = roles.includes('owner');
  const displayName = form.full_name || form.first_name || user?.email || '';

  return (
    <div className="max-w-lg mx-auto pb-8">
      {/* Avatar + Name section */}
      <div className="flex flex-col items-center pt-6 pb-4">
        <AvatarUpload
          url={form.avatar_url}
          onUpload={url => {
            setForm(f => ({ ...f, avatar_url: url }));
            // Auto-save avatar
            updateProfile.mutate({ ...form, avatar_url: url });
          }}
        />
        <h2 className="text-xl font-bold text-foreground mt-4">{displayName} 👋</h2>
        <p className="text-sm text-muted-foreground">✨ Membre SomaGate</p>
      </div>

      {/* Bio */}
      <div className="mx-4 mb-4">
        <div
          className="bg-card rounded-xl p-4 border border-border cursor-pointer"
          onClick={() => setEditingBio(true)}
        >
          {editingBio ? (
            <div className="space-y-2">
              <Textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Ajoutez une biographie..."
                rows={3}
                className="bg-transparent border-0 p-0 resize-none focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingBio(false); }}>Annuler</Button>
                <Button size="sm" onClick={(e) => { e.stopPropagation(); handleSave(); }}>Enregistrer</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <p className={form.bio ? 'text-foreground' : 'text-muted-foreground'}>
                {form.bio || 'Ajoutez une biographie...'}
              </p>
              <Pencil className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
            </div>
          )}
        </div>
      </div>

      {/* Score */}
      <div className="mx-4 mb-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌱</span>
              <div>
                <p className="text-sm text-muted-foreground">Score de Chaleur</p>
                <p className="font-semibold text-foreground">Observateur</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-foreground">0</span>
              <span className="text-muted-foreground text-sm">/10</span>
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '0%' }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">↗ Swipez et visitez pour augmenter votre score</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mx-4 mb-4 grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border">
          <Eye className="h-5 w-5 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Biens vus</p>
          <p className="text-2xl font-bold text-foreground mt-1">0</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <Heart className="h-5 w-5 text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Matches</p>
          <p className="text-2xl font-bold text-foreground mt-1">0</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <CalendarDays className="h-5 w-5 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Visites</p>
          <p className="text-2xl font-bold text-foreground mt-1">0</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <MessageSquare className="h-5 w-5 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Messages</p>
          <div className="flex items-center justify-between mt-1">
            <ArrowRight className="h-5 w-5 text-foreground" />
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="mx-4">
        <h3 className="text-lg font-semibold text-foreground mb-3">Informations personnelles</h3>
        <div className="space-y-3">
          <InfoField
            icon={<User className="h-5 w-5" />}
            label="Prénom"
            value={form.first_name}
            placeholder="Votre prénom"
            editing={editingField === 'first_name'}
            onEdit={() => setEditingField('first_name')}
            onChange={v => setForm(f => ({ ...f, first_name: v }))}
            onSave={handleSave}
            onCancel={() => setEditingField(null)}
          />
          <InfoField
            icon={<User className="h-5 w-5" />}
            label="Nom"
            value={form.last_name}
            placeholder="Votre nom"
            editing={editingField === 'last_name'}
            onEdit={() => setEditingField('last_name')}
            onChange={v => setForm(f => ({ ...f, last_name: v }))}
            onSave={handleSave}
            onCancel={() => setEditingField(null)}
          />
          <InfoField
            icon={<User className="h-5 w-5" />}
            label="Nom complet"
            value={form.full_name}
            placeholder="Nom complet"
            editing={editingField === 'full_name'}
            onEdit={() => setEditingField('full_name')}
            onChange={v => setForm(f => ({ ...f, full_name: v }))}
            onSave={handleSave}
            onCancel={() => setEditingField(null)}
          />
          <InfoField
            icon={<MessageSquare className="h-5 w-5" />}
            label="WhatsApp"
            value={form.whatsapp}
            placeholder="+225..."
            editing={editingField === 'whatsapp'}
            onEdit={() => setEditingField('whatsapp')}
            onChange={v => setForm(f => ({ ...f, whatsapp: v }))}
            onSave={handleSave}
            onCancel={() => setEditingField(null)}
          />
          {isOwner && (
            <>
              <InfoField
                icon={<User className="h-5 w-5" />}
                label="Entreprise"
                value={form.company_name}
                placeholder="Nom de l'entreprise"
                editing={editingField === 'company_name'}
                onEdit={() => setEditingField('company_name')}
                onChange={v => setForm(f => ({ ...f, company_name: v }))}
                onSave={handleSave}
                onCancel={() => setEditingField(null)}
              />
              <InfoField
                icon={<User className="h-5 w-5" />}
                label="Adresse entreprise"
                value={form.company_address}
                placeholder="Adresse"
                editing={editingField === 'company_address'}
                onEdit={() => setEditingField('company_address')}
                onChange={v => setForm(f => ({ ...f, company_address: v }))}
                onSave={handleSave}
                onCancel={() => setEditingField(null)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoField({
  icon, label, value, placeholder, editing, onEdit, onChange, onSave, onCancel
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder: string;
  editing: boolean;
  onEdit: () => void;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      {editing ? (
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">{label}</label>
          <Input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="bg-transparent border-border"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={onCancel}>Annuler</Button>
            <Button size="sm" onClick={onSave}>OK</Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between cursor-pointer" onClick={onEdit}>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">{icon}</span>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={value ? 'text-foreground' : 'text-muted-foreground'}>
                {value || placeholder}
              </p>
            </div>
          </div>
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
