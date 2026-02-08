import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TransactionStatusBadge } from '@/components/workflow/TransactionStatus';
import { Search, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import type { TransactionStatus } from '@/types/workflow';

const TX_FILTERS = [
  { value: 'all', label: 'Toutes' },
  { value: 'active', label: 'En cours' },
  { value: 'deal_finalized', label: 'Finalisées' },
  { value: 'deal_cancelled', label: 'Annulées' },
] as const;

export function AdminTransactionsTab() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const { displayPrice } = useDisplayPrice();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['admin-all-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wf_transactions')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      if (!data?.length) return [];

      const allUserIds = [...new Set(data.flatMap(t => [t.buyer_id, t.seller_id]))];
      const propertyIds = [...new Set(data.map(t => t.property_id))];

      const [profilesRes, propertiesRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email').in('id', allUserIds),
        supabase.from('properties').select('id, type, adresse, prix, prix_currency').in('id', propertyIds),
      ]);

      const profileMap = new Map(profilesRes.data?.map(p => [p.id, p]) || []);
      const propMap = new Map(propertiesRes.data?.map(p => [p.id, p]) || []);

      return data.map(t => ({
        ...t,
        buyer_profile: profileMap.get(t.buyer_id),
        seller_profile: profileMap.get(t.seller_id),
        property: propMap.get(t.property_id),
      }));
    },
  });

  const finalStatuses = ['deal_finalized', 'deal_cancelled', 'archived'];

  const filtered = transactions?.filter(t => {
    if (filter === 'active' && finalStatuses.includes(t.status)) return false;
    if (filter === 'deal_finalized' && t.status !== 'deal_finalized') return false;
    if (filter === 'deal_cancelled' && t.status !== 'deal_cancelled') return false;

    if (search) {
      const s = search.toLowerCase();
      return (
        t.status.includes(s) ||
        t.buyer_profile?.full_name?.toLowerCase().includes(s) ||
        t.seller_profile?.full_name?.toLowerCase().includes(s) ||
        t.property?.adresse?.toLowerCase().includes(s) ||
        t.property?.type?.toLowerCase().includes(s)
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
      <div className="relative px-4">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher transaction..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
      </div>

      <div className="overflow-x-auto scrollbar-hide border-b border-border">
        <div className="flex gap-1.5 px-4 py-2 min-w-max">
          {TX_FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
              filter === f.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            )}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3 max-w-2xl mx-auto">
        {(!filtered || filtered.length === 0) && (
          <div className="text-center p-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">Aucune transaction trouvée</p>
          </div>
        )}
        {filtered?.map(tx => {
          const getName = (p: any) => p?.full_name || p?.email || 'Inconnu';
          return (
            <div
              key={tx.id}
              onClick={() => navigate(`/transaction/${tx.id}`)}
              className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-foreground font-medium capitalize">
                    {tx.property?.type} — {tx.property?.adresse}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getName(tx.buyer_profile)} ↔ {getName(tx.seller_profile)}
                  </p>
                </div>
                <TransactionStatusBadge status={tx.status as TransactionStatus} />
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>MAJ: {new Date(tx.updated_at).toLocaleDateString('fr-FR')}</span>
                {tx.offer_amount && (
                  <span className="text-primary font-medium">
                    Offre: {displayPrice(tx.offer_amount, tx.property?.prix_currency || 'XOF')}
                  </span>
                )}
                {tx.property?.prix && (
                  <span>Prix: {displayPrice(tx.property.prix, tx.property.prix_currency)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
