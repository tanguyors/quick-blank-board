import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VisitStatusBadge } from '@/components/visits/VisitStatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { CalendarDays, MapPin, Search, User } from 'lucide-react';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';

const FILTERS = [
  { value: 'all', label: 'Toutes' },
  { value: 'confirmed', label: 'Acceptées' },
  { value: 'pending', label: 'Demandées' },
  { value: 'completed', label: 'Réalisées' },
  { value: 'cancelled', label: 'Refusées' },
] as const;

export function AdminVisitsTab() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { displayPrice } = useDisplayPrice();
  const queryClient = useQueryClient();

  const { data: visits, isLoading } = useQuery({
    queryKey: ['admin-all-visits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select('*, properties(id, adresse, prix, type, prix_currency)')
        .order('proposed_date', { ascending: false })
        .limit(200);
      if (error) throw error;

      // Fetch buyer & owner profiles
      const userIds = [...new Set(data.flatMap(v => [v.buyer_id, v.owner_id]))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, first_name, last_name')
        .in('id', userIds);
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return data.map(v => ({
        ...v,
        buyer_profile: profileMap.get(v.buyer_id),
        owner_profile: profileMap.get(v.owner_id),
      }));
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, cancel_reason }: { id: string; status: string; cancel_reason?: string }) => {
      const { error } = await supabase.from('visits').update({ status: status as any, cancel_reason }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-all-visits'] }),
  });

  const filtered = visits?.filter(v => {
    if (filter !== 'all' && v.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      const property = v.properties as any;
      const buyerName = v.buyer_profile?.full_name || v.buyer_profile?.email || '';
      const ownerName = v.owner_profile?.full_name || v.owner_profile?.email || '';
      return (
        property?.adresse?.toLowerCase().includes(s) ||
        property?.type?.toLowerCase().includes(s) ||
        buyerName.toLowerCase().includes(s) ||
        ownerName.toLowerCase().includes(s)
      );
    }
    return true;
  });

  if (isLoading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative px-4">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher visite, bien, utilisateur..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
      </div>

      {/* Filter chips */}
      <div className="overflow-x-auto scrollbar-hide border-b border-border">
        <div className="flex gap-1.5 px-4 py-2 min-w-max">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
              filter === f.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            )}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="p-4 space-y-3 max-w-2xl mx-auto">
        {(!filtered || filtered.length === 0) && (
          <div className="text-center p-8">
            <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">Aucune visite trouvée</p>
          </div>
        )}
        {filtered?.map(visit => {
          const property = visit.properties as any;
          const getName = (p: any) => p?.full_name || `${p?.first_name || ''} ${p?.last_name || ''}`.trim() || p?.email || 'Inconnu';
          return (
            <div key={visit.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm capitalize truncate">
                    {property?.type || 'Bien'}
                  </p>
                  <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="text-xs truncate">{property?.adresse}</span>
                  </div>
                  {property?.prix && (
                    <p className="text-xs font-medium text-primary mt-1">
                      {displayPrice(property.prix, property.prix_currency)}
                    </p>
                  )}
                </div>
                <VisitStatusBadge status={visit.status} />
              </div>

              {/* Participants */}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" /> Acheteur: <span className="font-medium text-foreground">{getName(visit.buyer_profile)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" /> Vendeur: <span className="font-medium text-foreground">{getName(visit.owner_profile)}</span>
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="text-xs">
                  {format(new Date(visit.proposed_date), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                </span>
              </div>

              {visit.message && (
                <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2 mb-2">💬 {visit.message}</p>
              )}
              {visit.cancel_reason && (
                <p className="text-xs text-destructive bg-destructive/5 rounded-lg p-2 mb-2">Raison : {visit.cancel_reason}</p>
              )}

              {/* Admin actions for pending visits */}
              {visit.status === 'pending' && (
                <div className="flex gap-2 mt-2">
                  <Button size="sm" className="flex-1" onClick={() => updateStatus.mutate({ id: visit.id, status: 'confirmed' })}>
                    Accepter
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1" onClick={() => {
                    const reason = prompt("Raison du refus (optionnel) :");
                    updateStatus.mutate({ id: visit.id, status: 'cancelled', cancel_reason: reason || undefined });
                  }}>
                    Refuser
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
