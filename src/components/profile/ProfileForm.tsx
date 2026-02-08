import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { AvatarUpload } from './AvatarUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Flame, Heart, Star, CalendarDays, Eye, TrendingUp, ArrowRight, User, Pencil, Coins, SlidersHorizontal, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CertifiedBadge } from '@/components/ui/CertifiedBadge';
import { CURRENCIES } from '@/lib/currencies';
import { useBuyerPreferences } from '@/hooks/useBuyerPreferences';
import { useFavorites } from '@/hooks/useFavorites';
import { useVisits } from '@/hooks/useVisits';

export function ProfileForm() {
  const navigate = useNavigate();
  const { roles, refreshProfile, user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { preferences } = useBuyerPreferences();
  const { favorites } = useFavorites();
  const { visits } = useVisits();
  const [editingBio, setEditingBio] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [form, setForm] = useState({
    first_name: '', last_name: '', full_name: '', bio: '',
    whatsapp: '', avatar_url: '', company_name: '', company_address: '',
    preferred_currency: 'EUR',
  });

  useEffect(() => {
    if (profile.data) {
      const pd = profile.data as any;
      setForm({
        first_name: pd.first_name || '',
        last_name: pd.last_name || '',
        full_name: pd.full_name || '',
        bio: pd.bio || '',
        whatsapp: pd.whatsapp || '',
        avatar_url: pd.avatar_url || '',
        company_name: pd.company_name || '',
        company_address: pd.company_address || '',
        preferred_currency: pd.preferred_currency || 'EUR',
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

  // Dynamic stats
  const { data: stats } = useQuery({
    queryKey: ['profile-stats', user?.id],
    queryFn: async () => {
      const [swipesRes, matchesRes, visitsRes] = await Promise.all([
        supabase.from('swipes').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
        supabase.from('matches').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
        supabase.from('visits').select('id', { count: 'exact', head: true }).eq('buyer_id', user!.id),
      ]);
      return {
        biens_vus: swipesRes.count || 0,
        matches: matchesRes.count || 0,
        visites: visitsRes.count || 0,
      };
    },
    enabled: !!user,
  });

  // User score
  const { data: userScore } = useQuery({
    queryKey: ['user-score', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('wf_user_scores')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const scoreValue = userScore?.score ?? 50;
  const scoreLevel = scoreValue >= 80 ? 'Expert' : scoreValue >= 60 ? 'Actif' : scoreValue >= 40 ? 'Observateur' : 'Débutant';
  const scoreEmoji = scoreValue >= 80 ? '🔥' : scoreValue >= 60 ? '⭐' : scoreValue >= 40 ? '🌱' : '🌱';

  const pendingVisitsCount = (visits.data || []).filter(v => v.status === 'pending').length;

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
        {userScore?.certified && <CertifiedBadge size="md" className="mt-2" />}
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
              <span className="text-2xl">{scoreEmoji}</span>
              <div>
                <p className="text-sm text-muted-foreground">Score de Chaleur</p>
                <p className="font-semibold text-foreground">{scoreLevel}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-foreground">{Math.round(scoreValue / 10)}</span>
              <span className="text-muted-foreground text-sm">/10</span>
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${scoreValue}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">↗ Swipez et visitez pour augmenter votre score</p>
          {userScore?.certified && (
            <div className="mt-2 flex items-center gap-1.5 text-primary text-xs font-medium">
              ✅ Client Certifié
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mx-4 mb-3 grid grid-cols-3 gap-3">
        <button
          onClick={() => navigate('/explore')}
          className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-left transition-colors active:bg-primary/20"
        >
          <Flame className="h-6 w-6 text-primary mb-2" />
          <p className="font-semibold text-foreground text-sm">Explorer</p>
          <p className="text-xs text-muted-foreground mt-0.5">Swiper</p>
        </button>
        <button
          onClick={() => navigate('/matches')}
          className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-left transition-colors active:bg-primary/20"
        >
          <Heart className="h-6 w-6 text-primary mb-2" />
          <p className="font-semibold text-foreground text-sm">Matches</p>
          <p className="text-xs text-muted-foreground mt-0.5">{stats?.matches ?? 0}</p>
        </button>
        <button
          onClick={() => navigate('/favorites')}
          className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-left transition-colors active:bg-amber-500/20"
        >
          <Star className="h-6 w-6 text-amber-500 mb-2" />
          <p className="font-semibold text-foreground text-sm">Favoris</p>
          <p className="text-xs text-muted-foreground mt-0.5">{favorites.data?.length ?? 0}</p>
        </button>
      </div>

      {/* Stats row */}
      <div className="mx-4 mb-4 grid grid-cols-3 gap-2">
        <button
          onClick={() => navigate('/explore')}
          className="bg-card border border-border rounded-xl p-3 text-center hover:border-primary/30 transition-colors"
        >
          <Eye className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{stats?.biens_vus ?? 0}</p>
          <p className="text-[10px] text-muted-foreground">Vus</p>
        </button>
        <button
          onClick={() => navigate('/visits')}
          className="bg-card border border-border rounded-xl p-3 text-center hover:border-primary/30 transition-colors relative"
        >
          <CalendarDays className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{stats?.visites ?? 0}</p>
          <p className="text-[10px] text-muted-foreground">Visites</p>
          {pendingVisitsCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
              {pendingVisitsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => navigate('/mes-transactions')}
          className="bg-card border border-border rounded-xl p-3 text-center hover:border-primary/30 transition-colors"
        >
          <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{Math.round(scoreValue / 10)}<span className="text-xs text-muted-foreground">/10</span></p>
          <p className="text-[10px] text-muted-foreground">Score</p>
        </button>
      </div>

      {/* Buyer Preferences */}
      <div className="mx-4 mb-4">
        <button
          onClick={() => navigate('/buyer/preferences')}
          className="w-full bg-card rounded-xl p-4 border border-border flex items-center justify-between hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="font-semibold text-foreground text-sm">Préférences de recherche</p>
              <p className="text-xs text-muted-foreground">
                {preferences.data?.is_complete ? 'Configuré ✅' : 'À configurer'}
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </button>
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
            placeholder="+62..."
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

          {/* Devise préférée */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3 mb-2">
              <Coins className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Devise préférée</p>
              </div>
            </div>
            <Select
              value={form.preferred_currency}
              onValueChange={v => {
                setForm(f => ({ ...f, preferred_currency: v }));
                updateProfile.mutate({ ...form, preferred_currency: v } as any);
                toast.success('Devise mise à jour');
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => (
                  <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
