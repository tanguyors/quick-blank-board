import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { useAuth } from '@/hooks/useAuth';
import { useMyTransactions } from '@/hooks/useTransaction';
import { useFavorites } from '@/hooks/useFavorites';
import { TransactionStatusBadge } from '@/components/workflow/TransactionStatus';
import { supabase } from '@/integrations/supabase/client';
import {
  Flame, Heart, Star, CalendarDays, FileText, MapPin, ArrowRight,
  TrendingUp, Eye, ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import type { TransactionStatus } from '@/types/workflow';

export default function BuyerDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data: transactions, isLoading: txLoading } = useMyTransactions();
  const { favorites } = useFavorites();

  const { data: stats } = useQuery({
    queryKey: ['buyer-dashboard-stats', user?.id],
    queryFn: async () => {
      const [swipesRes, matchesRes, visitsRes] = await Promise.all([
        supabase.from('swipes').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
        supabase.from('matches').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
        supabase.from('visits').select('id', { count: 'exact', head: true }).eq('buyer_id', user!.id).eq('status', 'confirmed'),
      ]);
      return {
        swipes: swipesRes.count || 0,
        matches: matchesRes.count || 0,
        upcomingVisits: visitsRes.count || 0,
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

  const activeTransactions = transactions?.filter(t =>
    !['deal_finalized', 'deal_cancelled', 'archived'].includes(t.status)
  ) || [];

  const displayName = profile?.full_name || profile?.first_name || 'Acheteur';
  const scoreVal = userScore?.score ?? 50;

  return (
    <AppLayout hideHeader>
      <div className="flex flex-col h-full">
        {/* Header */}
        <PageTopBar>
          <div>
            <p className="text-lg font-bold text-foreground">Bonjour, {displayName} 👋</p>
            <p className="text-xs text-muted-foreground">Trouvez votre bien idéal</p>
          </div>
        </PageTopBar>

        <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-5">
          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
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
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <Eye className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{stats?.swipes ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">Vus</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <CalendarDays className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{stats?.upcomingVisits ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">Visites</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{Math.round(scoreVal / 10)}<span className="text-xs text-muted-foreground">/10</span></p>
              <p className="text-[10px] text-muted-foreground">Score</p>
            </div>
          </div>

          {/* Active Transactions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Transactions actives</h3>
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
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                <p className="text-sm text-muted-foreground">Aucune transaction en cours</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Explorez et matchez pour démarrer !</p>
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
                          <MapPin className="h-3 w-3 flex-shrink-0" />
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
                <p className="font-semibold text-foreground text-sm">Client Certifié</p>
                <p className="text-xs text-muted-foreground">Votre profil est vérifié et de confiance</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
