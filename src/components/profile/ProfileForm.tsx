import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { AvatarUpload } from './AvatarUpload';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Flame, Heart, Star, CalendarDays, Eye, TrendingUp, ArrowRight, Settings, SlidersHorizontal, Pencil } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CertifiedBadge } from '@/components/ui/CertifiedBadge';
import { useBuyerPreferences } from '@/hooks/useBuyerPreferences';
import { useFavorites } from '@/hooks/useFavorites';
import { useVisits } from '@/hooks/useVisits';
import { useTranslation } from 'react-i18next';

export function ProfileForm() {
  const navigate = useNavigate();
  const { roles, refreshProfile, user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { preferences } = useBuyerPreferences();
  const { favorites } = useFavorites();
  const { visits } = useVisits();
  const [editingBio, setEditingBio] = useState(false);
  const [form, setForm] = useState({
    bio: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (profile.data) {
      const pd = profile.data as any;
      setForm({
        bio: pd.bio || '',
        avatar_url: pd.avatar_url || '',
      });
    }
  }, [profile.data]);

  const handleSaveBio = async () => {
    try {
      await updateProfile.mutateAsync({ bio: form.bio });
      await refreshProfile();
      toast.success(t('profile.bioUpdated'));
      setEditingBio(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const { t } = useTranslation();
  const displayName = profile.data?.full_name || profile.data?.first_name || user?.email || '';

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
  const scoreLevelKey = scoreValue >= 80 ? 'expert' : scoreValue >= 60 ? 'active' : scoreValue >= 40 ? 'observer' : 'beginner';
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
            updateProfile.mutate({ avatar_url: url });
          }}
        />
        <h2 className="text-xl font-bold text-foreground mt-4">{displayName} 👋</h2>
        <p className="text-sm text-muted-foreground">✨ {t('profile.member')}</p>
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
                placeholder={t('profile.bio')}
                rows={3}
                className="bg-transparent border-0 p-0 resize-none focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingBio(false); }}>{t('profile.cancel')}</Button>
                <Button size="sm" onClick={(e) => { e.stopPropagation(); handleSaveBio(); }}>{t('profile.save')}</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <p className={form.bio ? 'text-foreground' : 'text-muted-foreground'}>
                {form.bio || t('profile.bio')}
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
                <p className="text-sm text-muted-foreground">{t('profile.heatScore')}</p>
                <p className="font-semibold text-foreground">{t(`profile.${scoreLevelKey}`)}</p>
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
          <p className="text-xs text-muted-foreground mt-2">{t('profile.swipeToIncrease')}</p>
          {userScore?.certified && (
            <div className="mt-2 flex items-center gap-1.5 text-primary text-xs font-medium">
              ✅ {t('profile.certifiedClient')}
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
          <p className="font-semibold text-foreground text-sm">{t('profile.explore')}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t('profile.swipe')}</p>
        </button>
        <button
          onClick={() => navigate('/matches')}
          className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-left transition-colors active:bg-primary/20"
        >
          <Heart className="h-6 w-6 text-primary mb-2" />
          <p className="font-semibold text-foreground text-sm">{t('nav.matches')}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{stats?.matches ?? 0}</p>
        </button>
        <button
          onClick={() => navigate('/favorites')}
          className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-left transition-colors active:bg-amber-500/20"
        >
          <Star className="h-6 w-6 text-amber-500 mb-2" />
          <p className="font-semibold text-foreground text-sm">{t('nav.favorites')}</p>
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
          <p className="text-[10px] text-muted-foreground">{t('profile.seen')}</p>
        </button>
        <button
          onClick={() => navigate('/visits')}
          className="bg-card border border-border rounded-xl p-3 text-center hover:border-primary/30 transition-colors relative"
        >
          <CalendarDays className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{stats?.visites ?? 0}</p>
          <p className="text-[10px] text-muted-foreground">{t('nav.visits')}</p>
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
          <p className="text-[10px] text-muted-foreground">{t('profile.score')}</p>
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
              <p className="font-semibold text-foreground text-sm">{t('profile.searchPreferences')}</p>
              <p className="text-xs text-muted-foreground">
                {preferences.data?.is_complete ? t('profile.configured') : t('profile.toConfigure')}
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Account Settings Button */}
      <div className="mx-4 mb-4">
        <button
          onClick={() => navigate('/account-settings')}
          className="w-full bg-card rounded-xl p-4 border border-border flex items-center justify-between hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <div className="text-left">
              <p className="font-semibold text-foreground text-sm">{t('profile.accountSettings')}</p>
              <p className="text-xs text-muted-foreground">{t('profile.accountSettingsDesc')}</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
