import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Mail, CalendarDays, Phone, Briefcase, CreditCard, Shield, Bell, AlertTriangle, Save } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { CURRENCIES } from '@/lib/currencies';
import { CertifiedBadge } from '@/components/ui/CertifiedBadge';

export function OwnerProfileTab() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { updateProfile } = useProfile();
  const [form, setForm] = useState({
    first_name: '', last_name: '', full_name: '', bio: '',
    whatsapp: '', avatar_url: '', company_name: '', company_address: '',
    preferred_currency: 'EUR', birth_date: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        whatsapp: profile.whatsapp || '',
        avatar_url: profile.avatar_url || '',
        company_name: profile.company_name || '',
        company_address: profile.company_address || '',
        preferred_currency: profile.preferred_currency || 'EUR',
        birth_date: profile.birth_date || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(form as any);
      await refreshProfile();
      toast.success('Profil mis à jour');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const displayName = form.full_name || `${form.first_name} ${form.last_name}`.trim() || user?.email?.split('@')[0] || '';
  const memberSince = user?.created_at ? format(new Date(user.created_at), 'd MMMM yyyy', { locale: fr }) : '';

  return (
    <div className="p-4 space-y-4 pb-8">
      {/* Avatar + Name card */}
      <div className="bg-card rounded-2xl p-5 border border-border">
        <div className="flex items-center gap-4">
          <AvatarUpload
            url={form.avatar_url}
            onUpload={url => {
              setForm(f => ({ ...f, avatar_url: url }));
              updateProfile.mutate({ avatar_url: url } as any);
            }}
          />
          <div>
            <h3 className="text-lg font-bold text-foreground">{displayName}</h3>
            <p className="text-sm text-muted-foreground">✓ Membre SomaGate Pro</p>
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="bg-card rounded-2xl p-5 border border-border space-y-5">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-bold text-foreground">Informations personnelles</h3>
        </div>
        <p className="text-sm text-muted-foreground -mt-3">Gérez vos informations de profil et préférences de compte</p>

        <FormField icon={<Mail className="h-4 w-4" />} label="Email" value={user?.email || ''} disabled hint="Un email de confirmation sera envoyé pour tout changement" />
        <FormField icon={<CalendarDays className="h-4 w-4" />} label="Membre depuis" value={memberSince} disabled hint="Information d'inscription (non modifiable)" />

        <div className="border-t border-border pt-4 space-y-4">
          <InputField label="Prénom" value={form.first_name} placeholder="Votre prénom" onChange={v => setForm(f => ({ ...f, first_name: v }))} />
          <InputField label="Nom" value={form.last_name} placeholder="Votre nom" onChange={v => setForm(f => ({ ...f, last_name: v }))} />
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Date de naissance</label>
            <Input
              type="date"
              value={form.birth_date}
              onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))}
              className="bg-secondary/50 border-border"
            />
          </div>
          <InputField label="Téléphone / WhatsApp" value={form.whatsapp} placeholder="+33 6 12 34 56 78" onChange={v => setForm(f => ({ ...f, whatsapp: v }))} />
        </div>
      </div>

      {/* Informations professionnelles */}
      <div className="bg-card rounded-2xl p-5 border border-border space-y-5">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-bold text-foreground">Informations professionnelles</h3>
        </div>
        <p className="text-sm text-muted-foreground -mt-3">Vos informations en tant que vendeur/loueur</p>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Type de compte</label>
          <Select defaultValue="">
            <SelectTrigger className="bg-secondary/50 border-border">
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="particulier">Particulier</SelectItem>
              <SelectItem value="agence">Agence immobilière</SelectItem>
              <SelectItem value="promoteur">Promoteur</SelectItem>
              <SelectItem value="entreprise">Entreprise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <InputField label="Nom de l'entreprise" value={form.company_name} placeholder="Nom de votre entreprise" onChange={v => setForm(f => ({ ...f, company_name: v }))} />
        <InputField label="Adresse professionnelle" value={form.company_address} placeholder="Votre adresse professionnelle" onChange={v => setForm(f => ({ ...f, company_address: v }))} />
      </div>

      {/* Devise préférée */}
      <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-bold text-foreground">Devise préférée</h3>
        </div>
        <Select
          value={form.preferred_currency}
          onValueChange={v => {
            setForm(f => ({ ...f, preferred_currency: v }));
            updateProfile.mutate({ preferred_currency: v } as any);
            toast.success('Devise mise à jour');
          }}
        >
          <SelectTrigger className="bg-secondary/50 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map(c => (
              <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2" disabled={updateProfile.isPending}>
          <Save className="h-4 w-4" /> Sauvegarder les modifications
        </Button>
      </div>

      {/* Sécurité */}
      <div className="bg-card rounded-2xl p-5 border border-border space-y-5">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-bold text-foreground">Sécurité</h3>
        </div>
        <p className="text-sm text-muted-foreground -mt-3">Gérez vos paramètres de sécurité et d'authentification</p>

        <div className="flex items-center justify-between py-2 border-b border-border">
          <div>
            <p className="font-medium text-foreground">Authentification à deux facteurs (2FA)</p>
            <p className="text-sm text-muted-foreground">Ajoutez une couche de sécurité supplémentaire</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Désactivé</span>
            <Button variant="outline" size="sm">Activer le 2FA</Button>
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium text-foreground">Mot de passe</p>
            <p className="text-sm text-muted-foreground">Dernière modification : il y a plus de 30 jours</p>
          </div>
          <Button variant="outline" size="sm">Changer le mot de passe</Button>
        </div>
      </div>

      {/* Préférences de communication */}
      <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-bold text-foreground">Préférences de communication</h3>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">Gérez vos préférences d'email et de notifications</p>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium text-foreground">Recevoir la newsletter</p>
            <p className="text-sm text-muted-foreground">Recevez nos dernières offres et actualités par email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all" />
          </label>
        </div>
      </div>

      {/* Zone de danger */}
      <div className="bg-card rounded-2xl p-5 border-2 border-destructive/30 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="text-lg font-bold text-destructive">Zone de danger</h3>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">Actions irréversibles sur votre compte</p>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium text-foreground">Supprimer définitivement mon compte</p>
            <p className="text-sm text-muted-foreground">Cette action est irréversible. Toutes vos données seront supprimées définitivement.</p>
          </div>
          <Button variant="destructive" size="sm">Supprimer mon compte</Button>
        </div>
      </div>
    </div>
  );
}

function FormField({ icon, label, value, disabled, hint }: {
  icon: React.ReactNode; label: string; value: string; disabled?: boolean; hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-muted-foreground">{icon}</span>
        <label className="text-sm font-medium text-foreground">{label}</label>
      </div>
      <Input value={value} disabled={disabled} className="bg-secondary/50 border-border disabled:opacity-60" readOnly />
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

function InputField({ label, value, placeholder, onChange }: {
  label: string; value: string; placeholder: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-secondary/50 border-border"
      />
    </div>
  );
}
