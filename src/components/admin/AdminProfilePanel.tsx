import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Shield, Users, Building2, FileText, CalendarDays, Settings,
  LogOut, Save, ArrowRight, Activity, AlertTriangle, Eye,
  MessageSquare, TrendingUp, Database, Bell, Map,
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function AdminProfilePanel() {
  const navigate = useNavigate();
  const { user, profile: authProfile, signOut, refreshProfile: refreshAuthProfile } = useAuth();
  const { profile, updateProfile } = useProfile();

  const [form, setForm] = useState({
    full_name: '',
    first_name: '',
    last_name: '',
    whatsapp: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (profile.data) {
      const p = profile.data;
      setForm({
        full_name: p.full_name || '',
        first_name: p.first_name || '',
        last_name: p.last_name || '',
        whatsapp: p.whatsapp || '',
        avatar_url: p.avatar_url || '',
      });
    }
  }, [profile.data]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        full_name: form.full_name,
        first_name: form.first_name,
        last_name: form.last_name,
        whatsapp: form.whatsapp,
      });
      await refreshAuthProfile();
      toast.success('Profil admin mis à jour');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Platform health stats
  const { data: health } = useQuery({
    queryKey: ['admin-health'],
    queryFn: async () => {
      const [usersRes, propsRes, publishedRes, txRes, visitsRes, pendingVisitsRes, matchesRes, conversationsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('wf_transactions').select('id', { count: 'exact', head: true }),
        supabase.from('visits').select('id', { count: 'exact', head: true }),
        supabase.from('visits').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('matches').select('id', { count: 'exact', head: true }),
        supabase.from('conversations').select('id', { count: 'exact', head: true }),
      ]);
      return {
        totalUsers: usersRes.count || 0,
        totalProperties: propsRes.count || 0,
        publishedProperties: publishedRes.count || 0,
        totalTransactions: txRes.count || 0,
        totalVisits: visitsRes.count || 0,
        pendingVisits: pendingVisitsRes.count || 0,
        totalMatches: matchesRes.count || 0,
        totalConversations: conversationsRes.count || 0,
      };
    },
  });

  const displayName = form.full_name || form.first_name || user?.email || 'Admin';

  const quickLinks = [
    { label: 'Vue globale', icon: TrendingUp, to: '/admin' },
    { label: 'Utilisateurs', icon: Users, to: '/admin?tab=users' },
    { label: 'Biens', icon: Building2, to: '/admin?tab=properties' },
    { label: 'Visites', icon: CalendarDays, to: '/admin?tab=visits' },
    { label: 'Transactions', icon: FileText, to: '/admin?tab=transactions' },
    { label: 'Carte', icon: Map, to: '/admin?tab=map' },
  ];

  const platformStats = [
    { label: 'Utilisateurs', value: health?.totalUsers, icon: Users },
    { label: 'Biens publiés', value: health?.publishedProperties, suffix: `/${health?.totalProperties ?? 0}`, icon: Building2 },
    { label: 'Matches', value: health?.totalMatches, icon: Activity },
    { label: 'Conversations', value: health?.totalConversations, icon: MessageSquare },
    { label: 'Visites', value: health?.totalVisits, suffix: health?.pendingVisits ? ` (${health.pendingVisits} en attente)` : '', icon: Eye },
    { label: 'Transactions', value: health?.totalTransactions, icon: FileText },
  ];

  return (
    <div className="max-w-lg mx-auto pb-8">
      {/* Admin identity header */}
      <div className="flex flex-col items-center pt-6 pb-4">
        <AvatarUpload
          url={form.avatar_url}
          onUpload={url => {
            setForm(f => ({ ...f, avatar_url: url }));
            updateProfile.mutate({ avatar_url: url });
          }}
        />
        <h2 className="text-xl font-bold text-foreground mt-4">{displayName}</h2>
        <Badge variant="destructive" className="mt-1.5 gap-1">
          <Shield className="h-3 w-3" />
          Administrateur
        </Badge>
        <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
      </div>

      {/* Quick nav to admin sections */}
      <div className="mx-4 mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-2 px-1">Gestion de la plateforme</h3>
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {quickLinks.map(link => (
            <button
              key={link.to}
              onClick={() => navigate(link.to)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              <div className="flex items-center gap-3">
                <link.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{link.label}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Platform health */}
      <div className="mx-4 mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-2 px-1">Santé de la plateforme</h3>
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {platformStats.map(stat => (
            <div key={stat.label} className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-3">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <span className="text-sm font-bold text-foreground">
                {stat.value ?? '—'}{stat.suffix || ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin profile info */}
      <div className="mx-4 mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-2 px-1">Mon profil administrateur</h3>
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Nom complet</label>
            <Input
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="Votre nom complet"
              className="bg-secondary/50 border-border"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Prénom</label>
              <Input
                value={form.first_name}
                onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                placeholder="Prénom"
                className="bg-secondary/50 border-border"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nom</label>
              <Input
                value={form.last_name}
                onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                placeholder="Nom"
                className="bg-secondary/50 border-border"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">WhatsApp</label>
            <Input
              value={form.whatsapp}
              onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
              placeholder="+62..."
              className="bg-secondary/50 border-border"
            />
          </div>
          <Button onClick={handleSave} className="w-full gap-2 mt-2" size="sm" disabled={updateProfile.isPending}>
            <Save className="h-4 w-4" /> Sauvegarder
          </Button>
        </div>
      </div>

      {/* Déconnexion + Danger */}
      <div className="mx-4 mb-4">
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <Button variant="outline" className="w-full gap-2" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" /> Se déconnecter
          </Button>
        </div>
      </div>

      <div className="mx-4 mb-4">
        <div className="bg-card border-2 border-destructive/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-bold text-destructive">Zone de danger</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Opérations irréversibles sur la plateforme.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="w-full">
                Supprimer mon compte admin
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer votre compte admin ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action supprimera votre accès administrateur. Contactez le support pour procéder.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => toast.info('Contactez le support pour cette opération.')}
                >
                  Confirmer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
