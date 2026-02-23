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
import { ArrowLeft, User, MessageSquare, CreditCard, LogOut, AlertTriangle, Save, Globe } from 'lucide-react';
import { CURRENCIES } from '@/lib/currencies';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AccountSettings() {
  const navigate = useNavigate();
  const { user, signOut, refreshProfile, roles } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { t } = useTranslation();
  const isOwner = roles.includes('owner');
  const [form, setForm] = useState({
    first_name: '', last_name: '', full_name: '', whatsapp: '',
    preferred_currency: 'EUR', nationality: '',
    notif_push: true, notif_email: true, notif_whatsapp: true, notif_newsletter: true,
  });

  useEffect(() => {
    if (profile.data) {
      const p = profile.data as any;
      setForm({
        first_name: p.first_name || '', last_name: p.last_name || '',
        full_name: p.full_name || '', whatsapp: p.whatsapp || '',
        preferred_currency: p.preferred_currency || 'EUR',
        nationality: p.nationality || '',
        notif_push: p.notif_push ?? true, notif_email: p.notif_email ?? true,
        notif_whatsapp: p.notif_whatsapp ?? true, notif_newsletter: p.notif_newsletter ?? true,
      });
    }
  }, [profile.data]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ ...form, nationality: form.nationality || null } as any);
      await refreshProfile();
      toast.success(t('settings.profileUpdated'));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  return (
    <AppLayout hideHeader>
      <div className="flex flex-col h-full">
        <PageTopBar>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/profile')} className="text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="font-semibold text-foreground">{t('settings.title')}</span>
          </div>
        </PageTopBar>

        <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full space-y-4 pb-8">
          {/* Personal info */}
          <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-bold text-foreground">{t('settings.personalInfo')}</h3>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t('profile.firstName')}</label>
              <Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder={t('settings.yourFirstName')} className="bg-secondary/50 border-border" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t('profile.lastName')}</label>
              <Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder={t('settings.yourLastName')} className="bg-secondary/50 border-border" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t('settings.fullName')}</label>
              <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder={t('settings.fullName')} className="bg-secondary/50 border-border" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">{t('settings.whatsapp')}</label>
              </div>
              <Input value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="+62..." className="bg-secondary/50 border-border" />
            </div>
            {isOwner && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t('profile.nationality')}</label>
                <Input value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))} placeholder={t('profile.nationalityPlaceholder')} className="bg-secondary/50 border-border" />
              </div>
            )}
          </div>

          {/* Language */}
          <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-bold text-foreground">{t('settings.language')}</h3>
            </div>
            <LanguageSelector />
          </div>

          {/* Currency */}
          <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-bold text-foreground">{t('settings.preferredCurrency')}</h3>
            </div>
            <Select value={form.preferred_currency} onValueChange={v => { setForm(f => ({ ...f, preferred_currency: v })); updateProfile.mutate({ preferred_currency: v } as any); toast.success(t('settings.currencyUpdated')); }}>
              <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
              <SelectContent>{CURRENCIES.map(c => (<SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>))}</SelectContent>
            </Select>
          </div>

          <NotificationSettings
            prefs={{ notif_push: form.notif_push, notif_email: form.notif_email, notif_whatsapp: form.notif_whatsapp, notif_newsletter: form.notif_newsletter }}
            onToggle={(key, value) => { setForm(f => ({ ...f, [key]: value })); updateProfile.mutate({ [key]: value } as any); toast.success(t('settings.prefUpdated')); }}
          />

          <Button onClick={handleSave} className="w-full gap-2" disabled={updateProfile.isPending}>
            <Save className="h-4 w-4" /> {t('settings.saveChanges')}
          </Button>

          {/* Sign out */}
          <div className="bg-card rounded-2xl p-5 border border-border space-y-3">
            <div className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-bold text-foreground">{t('settings.signOut')}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{t('settings.signOutDesc')}</p>
            <Button variant="outline" className="w-full gap-2" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> {t('settings.signOutBtn')}
            </Button>
          </div>

          {/* Danger zone */}
          <div className="bg-card rounded-2xl p-5 border-2 border-destructive/30 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="text-lg font-bold text-destructive">{t('settings.dangerZone')}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{t('settings.dangerDesc')}</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">{t('settings.deleteAccount')}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('settings.deleteConfirmTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('settings.deleteConfirmDesc')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('settings.cancelBtn')}</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => { toast.info(t('settings.contactSupport')); }}>
                    {t('settings.confirmDelete')}
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
