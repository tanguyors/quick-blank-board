import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Mail, CalendarDays, Phone, Briefcase, CreditCard, Shield, AlertTriangle, Save, LogOut, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { CURRENCIES } from '@/lib/currencies';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { useTranslation } from 'react-i18next';

export function OwnerProfileTab() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { updateProfile } = useProfile();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    first_name: '', last_name: '', full_name: '', bio: '',
    whatsapp: '', avatar_url: '', company_name: '', company_address: '',
    preferred_currency: 'EUR', birth_date: '', nationality: '',
    notif_push: true, notif_email: true, notif_whatsapp: true, notif_newsletter: true,
  });

  useEffect(() => {
    if (profile) {
      const p = profile as any;
      setForm({
        first_name: p.first_name || '', last_name: p.last_name || '',
        full_name: p.full_name || '', bio: p.bio || '',
        whatsapp: p.whatsapp || '', avatar_url: p.avatar_url || '',
        company_name: p.company_name || '', company_address: p.company_address || '',
        preferred_currency: p.preferred_currency || 'EUR', birth_date: p.birth_date || '',
        nationality: p.nationality || '',
        notif_push: p.notif_push ?? true, notif_email: p.notif_email ?? true,
        notif_whatsapp: p.notif_whatsapp ?? true, notif_newsletter: p.notif_newsletter ?? true,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ ...form, birth_date: form.birth_date || null, nationality: form.nationality || null } as any);
      await refreshProfile();
      toast.success(t('settings.profileUpdated'));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const displayName = form.full_name || `${form.first_name} ${form.last_name}`.trim() || user?.email?.split('@')[0] || '';
  const memberSince = user?.created_at ? format(new Date(user.created_at), 'd MMMM yyyy', { locale: fr }) : '';

  return (
    <div className="p-4 space-y-4 pb-8">
      {/* Personal info */}
      <div className="bg-card rounded-2xl p-5 border border-border space-y-5">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-bold text-foreground">{t('owner.personalInfo')}</h3>
        </div>
        <p className="text-sm text-muted-foreground -mt-3">{t('owner.manageProfile')}</p>

        <FormField icon={<Mail className="h-4 w-4" />} label={t('auth.email')} value={user?.email || ''} disabled hint={t('owner.emailHint')} />
        <FormField icon={<CalendarDays className="h-4 w-4" />} label={t('owner.memberSince')} value={memberSince} disabled hint={t('owner.memberHint')} />

        <div className="border-t border-border pt-4 space-y-4">
          <InputField label={t('profile.firstName')} value={form.first_name} placeholder={t('settings.yourFirstName')} onChange={v => setForm(f => ({ ...f, first_name: v }))} />
          <InputField label={t('profile.lastName')} value={form.last_name} placeholder={t('settings.yourLastName')} onChange={v => setForm(f => ({ ...f, last_name: v }))} />
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{t('owner.birthDate')}</label>
            <Input type="date" value={form.birth_date} onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))} className="bg-secondary/50 border-border" />
          </div>
          <InputField label={t('owner.phone')} value={form.whatsapp} placeholder="+33 6 12 34 56 78" onChange={v => setForm(f => ({ ...f, whatsapp: v }))} />
        </div>
      </div>

      {/* Professional info */}
      <div className="bg-card rounded-2xl p-5 border border-border space-y-5">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-bold text-foreground">{t('owner.professionalInfo')}</h3>
        </div>
        <p className="text-sm text-muted-foreground -mt-3">{t('owner.professionalDesc')}</p>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">{t('owner.accountType')}</label>
          <Select defaultValue="">
            <SelectTrigger className="bg-secondary/50 border-border"><SelectValue placeholder={t('owner.selectType')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="particulier">{t('owner.individual')}</SelectItem>
              <SelectItem value="agence">{t('owner.agency')}</SelectItem>
              <SelectItem value="promoteur">{t('owner.developer')}</SelectItem>
              <SelectItem value="entreprise">{t('owner.company')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <InputField label={t('owner.companyName')} value={form.company_name} placeholder={t('owner.companyNamePlaceholder')} onChange={v => setForm(f => ({ ...f, company_name: v }))} />
        <InputField label={t('owner.businessAddress')} value={form.company_address} placeholder={t('owner.businessAddressPlaceholder')} onChange={v => setForm(f => ({ ...f, company_address: v }))} />
        <InputField label={t('owner.nationality')} value={form.nationality} placeholder={t('owner.nationalityPlaceholder')} onChange={v => setForm(f => ({ ...f, nationality: v }))} />
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

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2" disabled={updateProfile.isPending}>
          <Save className="h-4 w-4" /> {t('settings.saveChanges')}
        </Button>
      </div>

      {/* Security */}
      <div className="bg-card rounded-2xl p-5 border border-border space-y-5">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-bold text-foreground">{t('owner.security')}</h3>
        </div>
        <p className="text-sm text-muted-foreground -mt-3">{t('owner.securityDesc')}</p>
        <div className="flex items-center justify-between py-2 border-b border-border">
          <div>
            <p className="font-medium text-foreground">{t('owner.twoFa')}</p>
            <p className="text-sm text-muted-foreground">{t('owner.twoFaDesc')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('owner.disabled')}</span>
            <Button variant="outline" size="sm">{t('owner.enable2fa')}</Button>
          </div>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium text-foreground">{t('owner.passwordLabel')}</p>
            <p className="text-sm text-muted-foreground">{t('owner.passwordHint')}</p>
          </div>
          <Button variant="outline" size="sm">{t('owner.changePassword')}</Button>
        </div>
      </div>

      <NotificationSettings
        prefs={{ notif_push: form.notif_push, notif_email: form.notif_email, notif_whatsapp: form.notif_whatsapp, notif_newsletter: form.notif_newsletter }}
        onToggle={(key, value) => { setForm(f => ({ ...f, [key]: value })); updateProfile.mutate({ [key]: value } as any); toast.success(t('settings.prefUpdated')); }}
      />

      {/* Sign out */}
      <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
        <div className="flex items-center gap-2">
          <LogOut className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-bold text-foreground">{t('settings.signOut')}</h3>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">{t('settings.signOutDesc')}</p>
        <Button variant="outline" className="w-full gap-2" onClick={async () => { await signOut(); }}>
          <LogOut className="h-4 w-4" /> {t('settings.signOutBtn')}
        </Button>
      </div>

      {/* Danger zone */}
      <div className="bg-card rounded-2xl p-5 border-2 border-destructive/30 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="text-lg font-bold text-destructive">{t('settings.dangerZone')}</h3>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">{t('owner.dangerActions')}</p>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium text-foreground">{t('owner.deleteAccountPermanent')}</p>
            <p className="text-sm text-muted-foreground">{t('settings.dangerDesc')}</p>
          </div>
          <Button variant="destructive" size="sm">{t('settings.deleteAccount')}</Button>
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
      <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="bg-secondary/50 border-border" />
    </div>
  );
}
