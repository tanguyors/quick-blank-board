import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, User, MessageSquare, CreditCard, LogOut, AlertTriangle, Save } from 'lucide-react';
import { CURRENCIES } from '@/lib/currencies';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AccountSettings() {
  const navigate = useNavigate();
  const { user, signOut, refreshProfile } = useAuth();
  const { profile, updateProfile } = useProfile();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    full_name: '',
    whatsapp: '',
    preferred_currency: 'EUR',
    notif_push: true,
    notif_email: true,
    notif_whatsapp: true,
    notif_newsletter: true,
  });

  useEffect(() => {
    if (profile.data) {
      const p = profile.data as any;
      setForm({
        first_name: p.first_name || '',
        last_name: p.last_name || '',
        full_name: p.full_name || '',
        whatsapp: p.whatsapp || '',
        preferred_currency: p.preferred_currency || 'EUR',
        notif_push: p.notif_push ?? true,
        notif_email: p.notif_email ?? true,
        notif_whatsapp: p.notif_whatsapp ?? true,
        notif_newsletter: p.notif_newsletter ?? true,
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <AppLayout hideHeader>
      <div className="flex flex-col h-full">
        {/* Header */}
        <PageTopBar>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/profile')} className="text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="font-semibold text-foreground">Paramètres du compte</span>
          </div>
        </PageTopBar>

        <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full space-y-4 pb-8">
          {/* Informations personnelles */}
          <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-bold text-foreground">Informations personnelles</h3>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Prénom</label>
              <Input
                value={form.first_name}
                onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                placeholder="Votre prénom"
                className="bg-secondary/50 border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Nom</label>
              <Input
                value={form.last_name}
                onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                placeholder="Votre nom"
                className="bg-secondary/50 border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Nom complet</label>
              <Input
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                placeholder="Nom complet"
                className="bg-secondary/50 border-border"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">WhatsApp</label>
              </div>
              <Input
                value={form.whatsapp}
                onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                placeholder="+62..."
                className="bg-secondary/50 border-border"
              />
            </div>
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

          {/* Notifications */}
          <NotificationSettings
            prefs={{
              notif_push: form.notif_push,
              notif_email: form.notif_email,
              notif_whatsapp: form.notif_whatsapp,
              notif_newsletter: form.notif_newsletter,
            }}
            onToggle={(key, value) => {
              setForm(f => ({ ...f, [key]: value }));
              updateProfile.mutate({ [key]: value } as any);
              toast.success('Préférence mise à jour');
            }}
          />

          {/* Sauvegarder */}
          <Button onClick={handleSave} className="w-full gap-2" disabled={updateProfile.isPending}>
            <Save className="h-4 w-4" /> Sauvegarder les modifications
          </Button>

          {/* Déconnexion */}
          <div className="bg-card rounded-2xl p-5 border border-border space-y-3">
            <div className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-bold text-foreground">Déconnexion</h3>
            </div>
            <p className="text-sm text-muted-foreground">Se déconnecter de votre compte SomaGate</p>
            <Button variant="outline" className="w-full gap-2" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> Se déconnecter
            </Button>
          </div>

          {/* Zone de danger */}
          <div className="bg-card rounded-2xl p-5 border-2 border-destructive/30 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="text-lg font-bold text-destructive">Zone de danger</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Cette action est irréversible. Toutes vos données seront supprimées définitivement.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Supprimer mon compte
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer votre compte ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Toutes vos données, propriétés, transactions et messages seront définitivement supprimés.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={async () => {
                      toast.info('Contactez le support pour supprimer votre compte.');
                    }}
                  >
                    Confirmer la suppression
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
