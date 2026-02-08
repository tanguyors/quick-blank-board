import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, Building2, TrendingUp, FileText, CalendarDays, UserPlus, Activity, Handshake, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { subDays, subWeeks, subMonths, subYears, startOfDay, format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

type AdminTab = 'overview' | 'users' | 'transactions' | 'properties' | 'visits' | 'map';
type Period = 'day' | 'week' | 'month' | 'year';

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Aujourd\'hui' },
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'year', label: 'Année' },
];

function getPeriodStart(period: Period): string {
  const now = new Date();
  switch (period) {
    case 'day': return startOfDay(now).toISOString();
    case 'week': return subWeeks(startOfDay(now), 1).toISOString();
    case 'month': return subMonths(startOfDay(now), 1).toISOString();
    case 'year': return subYears(startOfDay(now), 1).toISOString();
  }
}

interface OverviewTabProps {
  onNavigate: (tab: AdminTab) => void;
}

export function AdminOverviewTab({ onNavigate }: OverviewTabProps) {
  const [period, setPeriod] = useState<Period>('week');

  // Global totals
  const totals = useQuery({
    queryKey: ['admin-totals'],
    queryFn: async () => {
      const [usersRes, propsRes, txRes, matchesRes, visitsRes, pendingPropsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('wf_transactions').select('id', { count: 'exact', head: true }),
        supabase.from('matches').select('id', { count: 'exact', head: true }),
        supabase.from('visits').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('is_published', false),
      ]);
      return {
        users: usersRes.count || 0,
        properties: propsRes.count || 0,
        transactions: txRes.count || 0,
        matches: matchesRes.count || 0,
        pendingVisits: visitsRes.count || 0,
        pendingProperties: pendingPropsRes.count || 0,
      };
    },
  });

  // Period-based stats
  const periodStart = getPeriodStart(period);

  const periodStats = useQuery({
    queryKey: ['admin-period-stats', period],
    queryFn: async () => {
      const [newUsersRes, matchesRes, visitsRes, finalizedRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', periodStart),
        supabase.from('matches').select('id', { count: 'exact', head: true }).gte('created_at', periodStart),
        supabase.from('visits').select('id', { count: 'exact', head: true }).gte('created_at', periodStart),
        supabase.from('wf_transactions').select('id', { count: 'exact', head: true }).eq('status', 'deal_finalized').gte('deal_finalized_at', periodStart),
      ]);

      // Active users = users who swiped, matched, visited, or messaged in period
      const [swipersRes, matchUsersRes] = await Promise.all([
        supabase.from('swipes').select('user_id').gte('created_at', periodStart).limit(500),
        supabase.from('matches').select('user_id, owner_id').gte('created_at', periodStart).limit(500),
      ]);

      const activeUserIds = new Set<string>();
      swipersRes.data?.forEach(s => activeUserIds.add(s.user_id));
      matchUsersRes.data?.forEach(m => {
        activeUserIds.add(m.user_id);
        activeUserIds.add(m.owner_id);
      });

      return {
        newUsers: newUsersRes.count || 0,
        activeUsers: activeUserIds.size,
        matches: matchesRes.count || 0,
        visits: visitsRes.count || 0,
        finalized: finalizedRes.count || 0,
      };
    },
  });

  const totalCards: { label: string; value: number | undefined; icon: typeof Users; tab: AdminTab }[] = [
    { label: 'Utilisateurs', value: totals.data?.users, icon: Users, tab: 'users' },
    { label: 'Biens', value: totals.data?.properties, icon: Building2, tab: 'properties' },
    { label: 'Transactions', value: totals.data?.transactions, icon: FileText, tab: 'transactions' },
    { label: 'Matches', value: totals.data?.matches, icon: TrendingUp, tab: 'transactions' },
    { label: 'Visites en attente', value: totals.data?.pendingVisits, icon: CalendarDays, tab: 'visits' },
    { label: 'Biens à valider', value: totals.data?.pendingProperties, icon: Building2, tab: 'properties' },
  ];

  const periodCards: { label: string; value: number | undefined; icon: typeof Users }[] = [
    { label: 'Nouveaux utilisateurs', value: periodStats.data?.newUsers, icon: UserPlus },
    { label: 'Utilisateurs actifs', value: periodStats.data?.activeUsers, icon: Activity },
    { label: 'Matches', value: periodStats.data?.matches, icon: Handshake },
    { label: 'Visites', value: periodStats.data?.visits, icon: Eye },
    { label: 'Transactions finalisées', value: periodStats.data?.finalized, icon: FileText },
  ];

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      {/* Global totals - clickable */}
      <div>
        <h3 className="font-semibold text-foreground text-sm mb-3">Totaux</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {totalCards.map(card => (
            <button
              key={card.label}
              onClick={() => onNavigate(card.tab)}
              className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary/40 transition-colors group"
            >
              <card.icon className="h-5 w-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-2xl font-bold text-foreground">{card.value ?? '—'}</div>
              <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Period selector + stats */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground text-sm">Statistiques</h3>
          <div className="flex gap-1 bg-secondary rounded-full p-0.5">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  period === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {periodCards.map(card => (
            <div key={card.label} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <card.icon className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">{card.label}</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                {periodStats.isLoading ? (
                  <span className="inline-block w-5 h-5 rounded bg-muted animate-pulse" />
                ) : (
                  card.value ?? '—'
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
