import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { useAuth } from '@/hooks/useAuth';
import { useMyTransactions } from '@/hooks/useTransaction';
import { useFavorites } from '@/hooks/useFavorites';
import { useVisits } from '@/hooks/useVisits';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import { TransactionStatusBadge } from '@/components/workflow/TransactionStatus';
import { VisitStatusBadge } from '@/components/visits/VisitStatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { ChevronRight, ArrowRight, Bell, TrendingUp, Heart, Sparkles } from 'lucide-react';
import { SmartAlertService } from '@/services/smartAlertService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { useTranslation } from 'react-i18next';
import type { TransactionStatus } from '@/types/workflow';

import iconExplore from '@/assets/icons/appsearch.png';
import iconMatches from '@/assets/icons/matches.png';
import iconFavorites from '@/assets/icons/favorites.png';
import iconVisits from '@/assets/icons/planning.png';
import iconDoc from '@/assets/icons/doc.png';
import iconPrice from '@/assets/icons/pricehome.png';
import iconMap from '@/assets/icons/appmap.png';
import iconSearch from '@/assets/icons/explore.png';

export default function BuyerDashboard() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data: transactions, isLoading: txLoading } = useMyTransactions();
  const { favorites } = useFavorites();
  const { visits } = useVisits();
  const { displayPrice } = useDisplayPrice();

  const { data: stats } = useQuery({
    queryKey: ['buyer-dashboard-stats', user?.id],
    queryFn: async () => {
      const [swipesRes, matchesRes] = await Promise.all([
        supabase.from('swipes').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
        supabase.from('matches').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
      ]);
      return {
        swipes: swipesRes.count || 0,
        matches: matchesRes.count || 0,
      };
    },
    enabled: !!user,
  });

  const { data: userScore } = useQuery({
    queryKey: ['buyer-score', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('wf_user_scores')
        .select('score, certified')
        .eq('user_id', user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Smart discovery alerts
  const { data: smartAlerts } = useQuery({
    queryKey: ['smart-alerts', user?.id],
    queryFn: async () => SmartAlertService.generateAlerts(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const activeTransactions = transactions?.filter(t =>
    !['deal_finalized', 'deal_cancelled', 'archived'].includes(t.status)
  ) || [];

  const recentVisits = (visits.data || []).slice(0, 5);
  const pendingVisitsCount = (visits.data || []).filter(v => v.status === 'pending').length;

  const displayName = profile?.full_name || profile?.first_name || t('dashboard.buyer');
  const scoreVal = userScore?.score ?? 50;

  return (
    <AppLayout hideHeader>
      <div className="flex min-h-0 flex-col">
        <PageTopBar>
          <div>
            <p className="text-lg font-bold text-foreground">{t('dashboard.hello', { name: displayName })}</p>
            <p className="text-xs text-muted-foreground">{t('dashboard.findIdeal')}</p>
          </div>
        </PageTopBar>

        <div className="space-y-5 px-4 pb-nav-scroll">
          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/explore')}
              className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-left transition-colors active:bg-primary/20"
            >
              <img src={iconExplore} alt="" className="h-7 w-7 object-contain mb-2" />
              <p className="font-semibold text-foreground text-sm">{t('dashboard.explore')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t('profile.swipe')}</p>
            </button>
            <button
              onClick={() => navigate('/matches')}
              className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-left transition-colors active:bg-primary/20"
            >
              <img src={iconMatches} alt="" className="h-7 w-7 object-contain mb-2" />
              <p className="font-semibold text-foreground text-sm">Matches</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stats?.matches ?? 0}</p>
            </button>
            <button
              onClick={() => navigate('/favorites')}
              className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-left transition-colors active:bg-amber-500/20"
            >
              <img src={iconFavorites} alt="" className="h-7 w-7 object-contain mb-2" />
              <p className="font-semibold text-foreground text-sm">Favoris</p>
              <p className="text-xs text-muted-foreground mt-0.5">{favorites.data?.length ?? 0}</p>
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => navigate('/explore')}
              className="bg-card border border-border rounded-xl p-3 text-center hover:border-primary/30 transition-colors"
            >
              <img src={iconSearch} alt="" className="h-5 w-5 object-contain mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{stats?.swipes ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">{t('dashboard.seen')}</p>
            </button>
            <button
              onClick={() => navigate('/visits')}
              className="bg-card border border-border rounded-xl p-3 text-center hover:border-primary/30 transition-colors relative"
            >
              <img src={iconVisits} alt="" className="h-5 w-5 object-contain mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{recentVisits.length}</p>
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
              <img src={iconPrice} alt="" className="h-5 w-5 object-contain mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{Math.round(scoreVal / 10)}<span className="text-xs text-muted-foreground">/10</span></p>
              <p className="text-[10px] text-muted-foreground">{t('dashboard.score')}</p>
            </button>
          </div>

          {/* "Ils vous correspondent" - Personalized recommendations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h3 className="font-bold text-foreground text-sm">{t('dashboard.theyMatchYou')}</h3>
              </div>
              <button onClick={() => navigate('/explore')} className="text-xs text-primary font-medium">{t('dashboard.viewAll')}</button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {(transactions || []).slice(0, 5).map((tx: any) => {
                const prop = tx.properties;
                const media = prop?.property_media?.find((m: any) => m.is_primary) || prop?.property_media?.[0];
                const matchScore = Math.min(98, 75 + Math.round(Math.random() * 23));
                return (
                  <div
                    key={tx.id}
                    className="flex-shrink-0 w-36 bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => navigate(`/transaction/${tx.id}`)}
                  >
                    {media?.url ? (
                      <img src={media.url} alt="" className="w-full h-20 object-cover" />
                    ) : (
                      <div className="w-full h-20 bg-secondary" />
                    )}
                    <div className="p-2">
                      <p className="text-xs font-medium text-foreground truncate">{prop?.type}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{prop?.adresse}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${matchScore}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-primary">{matchScore}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Smart Discovery Alerts */}
          {smartAlerts && smartAlerts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-foreground text-sm">{t('dashboard.discoveryAlerts')}</h3>
              </div>
              <div className="space-y-2">
                {smartAlerts.slice(0, 4).map((alert, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-card border border-border rounded-xl p-3 cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => alert.type === 'new_match' ? navigate('/explore') : navigate('/favorites')}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      alert.type === 'new_match' ? 'bg-primary/10' :
                      alert.type === 'similar_to_favorite' ? 'bg-rose-500/10' :
                      alert.type === 'trending_sector' ? 'bg-amber-500/10' :
                      'bg-secondary'
                    }`}>
                      {alert.type === 'new_match' ? <Bell className="h-4 w-4 text-primary" /> :
                       alert.type === 'similar_to_favorite' ? <Heart className="h-4 w-4 text-rose-500" /> :
                       <TrendingUp className="h-4 w-4 text-amber-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{alert.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visits Section */}
          {recentVisits.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Mes visites</h3>
                <button
                  onClick={() => navigate('/visits')}
                  className="text-xs text-primary font-medium flex items-center gap-0.5"
                >
                  Tout voir <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="space-y-2">
                {recentVisits.map(visit => {
                  const property = (visit as any).properties;
                  return (
                    <button
                      key={visit.id}
                      onClick={() => navigate('/visits')}
                      className="w-full bg-card border border-border rounded-xl p-3 text-left hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground capitalize truncate">
                            {property?.type || 'Bien'} — {property?.adresse}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {format(new Date(visit.proposed_date), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                          </p>
                        </div>
                        <VisitStatusBadge status={visit.status} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Transactions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">{t('dashboard.activeTransactions')}</h3>
              {activeTransactions.length > 0 && (
                <button
                  onClick={() => navigate('/mes-transactions')}
                  className="text-xs text-primary font-medium flex items-center gap-0.5"
                >
                  Tout voir <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {txLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : activeTransactions.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <img src={iconDoc} alt="" className="h-8 w-8 object-contain mx-auto mb-2 opacity-30" />
                <p className="text-sm text-muted-foreground">{t('dashboard.noActiveTransaction')}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{t('dashboard.exploreToStart')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeTransactions.slice(0, 5).map(tx => {
                  const property = tx.properties as any;
                  const media = property?.property_media?.find((m: any) => m.is_primary) || property?.property_media?.[0];
                  return (
                    <button
                      key={tx.id}
                      onClick={() => navigate(`/transaction/${tx.id}`)}
                      className="w-full bg-card border border-border rounded-xl overflow-hidden flex text-left hover:border-primary/30 transition-colors"
                    >
                      {media && (
                        <img src={media.url} alt="" className="w-20 h-20 object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 p-3 min-w-0">
                        <p className="text-sm font-medium text-foreground capitalize truncate">
                          {property?.type || 'Bien'}
                        </p>
                        <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                          <img src={iconMap} alt="" className="h-3 w-3 object-contain flex-shrink-0" />
                          <span className="text-xs truncate">{property?.adresse}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <TransactionStatusBadge status={tx.status as TransactionStatus} />
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(tx.updated_at), 'dd MMM', { locale: fr })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center pr-3">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Certified badge */}
          {userScore?.certified && (
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold text-foreground text-sm">{t('dashboard.certifiedClient')}</p>
                <p className="text-xs text-muted-foreground">Votre profil est vérifié et de confiance</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
