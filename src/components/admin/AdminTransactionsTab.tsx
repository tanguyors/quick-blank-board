import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { TransactionStatusBadge, TransactionTimeline } from '@/components/workflow/TransactionStatus';
import { Search, FileText, MessageSquare, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TransactionStatus } from '@/types/workflow';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { STATUS_LABELS } from '@/types/workflow';

const TX_FILTERS = [
  { value: 'all', label: 'Toutes' },
  { value: 'matched', label: 'Match' },
  { value: 'visit', label: 'Visites' },
  { value: 'intention_expressed', label: 'Intention' },
  { value: 'offer_made', label: 'Offre' },
  { value: 'documents', label: 'Documents' },
  { value: 'deal_finalized', label: 'Finalisées' },
  { value: 'cancelled', label: 'Annulées' },
  { value: 'archived', label: 'Archivées' },
] as const;

const VISIT_STATUSES: TransactionStatus[] = [
  'visit_requested', 'visit_proposed', 'visit_confirmed',
  'visit_completed', 'visit_cancelled', 'visit_rescheduled',
];
const DOCUMENT_STATUSES: TransactionStatus[] = ['documents_generated', 'in_validation'];
const CANCELLED_STATUSES: TransactionStatus[] = ['deal_cancelled', 'visit_cancelled'];

function matchesFilter(status: TransactionStatus, filter: string): boolean {
  if (filter === 'all') return true;
  if (filter === 'matched') return status === 'matched';
  if (filter === 'visit') return VISIT_STATUSES.includes(status);
  if (filter === 'intention_expressed') return status === 'intention_expressed';
  if (filter === 'offer_made') return status === 'offer_made';
  if (filter === 'documents') return DOCUMENT_STATUSES.includes(status);
  if (filter === 'deal_finalized') return status === 'deal_finalized';
  if (filter === 'cancelled') return CANCELLED_STATUSES.includes(status);
  if (filter === 'archived') return status === 'archived';
  return true;
}

export function AdminTransactionsTab() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const { displayPrice } = useDisplayPrice();
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'details' | 'messages'>('details');
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

  const filtered = transactions?.filter(t => {
    if (!matchesFilter(t.status as TransactionStatus, filter)) return false;

    if (search) {
      const s = search.toLowerCase();
      return (
        t.status.includes(s) ||
        (STATUS_LABELS[t.status as TransactionStatus] || '').toLowerCase().includes(s) ||
        t.buyer_profile?.full_name?.toLowerCase().includes(s) ||
        t.seller_profile?.full_name?.toLowerCase().includes(s) ||
        t.property?.adresse?.toLowerCase().includes(s) ||
        t.property?.type?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const selectedTx = transactions?.find(t => t.id === selectedTxId);

  if (isLoading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  return (
    <>
      <div className="space-y-3">
        <div className="relative px-4">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher transaction..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
        </div>

        <div className="overflow-x-auto scrollbar-hide border-b border-border">
          <div className="flex gap-1.5 px-4 py-2 min-w-max">
            {TX_FILTERS.map(f => {
              const count = f.value === 'all'
                ? transactions?.length
                : transactions?.filter(t => matchesFilter(t.status as TransactionStatus, f.value)).length;
              return (
                <button key={f.value} onClick={() => setFilter(f.value)} className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                  filter === f.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                )}>
                  {f.label}
                  {count !== undefined && count > 0 && (
                    <span className="ml-1 opacity-70">({count})</span>
                  )}
                </button>
              );
            })}
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
                onClick={() => setSelectedTxId(tx.id)}
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
                      Offre: {displayPrice(tx.offer_amount, tx.property?.prix_currency || 'IDR')}
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

      {/* Transaction detail Sheet */}
      <Sheet open={!!selectedTxId} onOpenChange={open => { if (!open) { setSelectedTxId(null); setDetailTab('details'); } }}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
          <SheetHeader className="px-4 pt-4 pb-0 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between pb-2">
              <SheetTitle className="text-base">Détail transaction</SheetTitle>
              {selectedTx && <TransactionStatusBadge status={selectedTx.status as TransactionStatus} />}
            </div>
            <div className="flex">
              <button
                onClick={() => setDetailTab('details')}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors",
                  detailTab === 'details' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
                )}
              >
                <Info className="h-4 w-4" /> Détails
              </button>
              <button
                onClick={() => setDetailTab('messages')}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors",
                  detailTab === 'messages' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
                )}
              >
                <MessageSquare className="h-4 w-4" /> Messages
              </button>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            {selectedTx && detailTab === 'details' && <TransactionDetailView tx={selectedTx} />}
            {selectedTx && detailTab === 'messages' && <TransactionMessagesView tx={selectedTx} />}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}

function TransactionDetailView({ tx }: { tx: any }) {
  const { displayPrice } = useDisplayPrice();
  const property = tx.property;
  const getName = (p: any) => p?.full_name || p?.email || 'Inconnu';

  const { data: logs } = useQuery({
    queryKey: ['admin-tx-logs', tx.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('wf_transaction_logs')
        .select('action, created_at, new_status')
        .eq('transaction_id', tx.id)
        .order('created_at', { ascending: true });
      return data || [];
    },
  });

  return (
    <div className="p-4 space-y-4">
      {/* Property info */}
      {property && (
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="font-semibold text-foreground capitalize">{property.type}</p>
          <p className="text-sm text-muted-foreground mt-1">{property.adresse}</p>
          {property.prix && (
            <p className="text-primary font-bold text-lg mt-2">
              {displayPrice(property.prix, property.prix_currency)}
            </p>
          )}
        </div>
      )}

      {/* Participants */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-2">
        <h3 className="font-semibold text-foreground text-sm">Participants</h3>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Acheteur</span>
          <span className="text-foreground">{getName(tx.buyer_profile)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Vendeur</span>
          <span className="text-foreground">{getName(tx.seller_profile)}</span>
        </div>
      </div>

      {/* Key dates */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-2">
        <h3 className="font-semibold text-foreground text-sm">Dates clés</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Match</span>
            <p className="text-foreground">{new Date(tx.matched_at).toLocaleDateString('fr-FR')}</p>
          </div>
          {tx.visit_requested_at && (
            <div>
              <span className="text-muted-foreground">Visite demandée</span>
              <p className="text-foreground">{new Date(tx.visit_requested_at).toLocaleDateString('fr-FR')}</p>
            </div>
          )}
          {tx.visit_confirmed_date && (
            <div>
              <span className="text-muted-foreground">Visite confirmée</span>
              <p className="text-foreground">{new Date(tx.visit_confirmed_date).toLocaleDateString('fr-FR')}</p>
            </div>
          )}
          {tx.visit_completed_at && (
            <div>
              <span className="text-muted-foreground">Visite effectuée</span>
              <p className="text-foreground">{new Date(tx.visit_completed_at).toLocaleDateString('fr-FR')}</p>
            </div>
          )}
          {tx.deal_finalized_at && (
            <div>
              <span className="text-muted-foreground">Deal finalisé</span>
              <p className="text-foreground">{new Date(tx.deal_finalized_at).toLocaleDateString('fr-FR')}</p>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Dernière MAJ</span>
            <p className="text-foreground">{new Date(tx.updated_at).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>

      {/* Offer info */}
      {tx.offer_amount && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-2">
          <h3 className="font-semibold text-foreground text-sm">Offre</h3>
          <p className="text-primary font-bold text-lg">{displayPrice(tx.offer_amount, property?.prix_currency || 'IDR')}</p>
          {tx.offer_type && <p className="text-xs text-muted-foreground capitalize">Type: {tx.offer_type.replace('_', ' ')}</p>}
          {tx.offer_details && <p className="text-xs text-muted-foreground">{tx.offer_details}</p>}
        </div>
      )}

      {/* Rejection info */}
      {tx.rejection_reason && (
        <div className="bg-card rounded-xl border border-destructive/30 p-4 space-y-1">
          <h3 className="font-semibold text-destructive text-sm">Motif d'annulation</h3>
          <p className="text-sm text-foreground">{tx.rejection_reason}</p>
          {tx.rejection_details && <p className="text-xs text-muted-foreground">{tx.rejection_details}</p>}
        </div>
      )}

      {/* Visit refusal info */}
      {tx.visit_refusal_reason && (
        <div className="bg-card rounded-xl border border-destructive/30 p-4 space-y-1">
          <h3 className="font-semibold text-destructive text-sm">Refus de visite</h3>
          <p className="text-sm text-foreground">{tx.visit_refusal_reason}</p>
          {tx.visit_refusal_details && <p className="text-xs text-muted-foreground">{tx.visit_refusal_details}</p>}
        </div>
      )}

      {/* Validation status */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-2">
        <h3 className="font-semibold text-foreground text-sm">Validations</h3>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Acheteur</span>
          <span className={tx.buyer_validated ? 'text-green-400' : 'text-muted-foreground'}>
            {tx.buyer_validated ? '✓ Validé' : 'En attente'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Vendeur</span>
          <span className={tx.seller_validated ? 'text-green-400' : 'text-muted-foreground'}>
            {tx.seller_validated ? '✓ Validé' : 'En attente'}
          </span>
        </div>
        {(tx.buyer_no_show || tx.seller_no_show) && (
          <div className="pt-1 border-t border-border">
            {tx.buyer_no_show && <p className="text-xs text-destructive">⚠ No-show acheteur</p>}
            {tx.seller_no_show && <p className="text-xs text-destructive">⚠ No-show vendeur</p>}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-semibold text-foreground text-sm mb-4">Progression</h3>
        <TransactionTimeline
          currentStatus={tx.status as TransactionStatus}
          logs={logs}
        />
      </div>
    </div>
  );
}

function TransactionMessagesView({ tx }: { tx: any }) {
  const getName = (p: any) => p?.full_name || p?.email || 'Inconnu';

  const { data: messages, isLoading } = useQuery({
    queryKey: ['admin-tx-messages', tx.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wf_messages')
        .select('*')
        .eq('transaction_id', tx.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ['admin-tx-msg-profiles', tx.buyer_id, tx.seller_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', [tx.buyer_id, tx.seller_id]);
      return new Map(data?.map(p => [p.id, p]) || []);
    },
  });

  if (isLoading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (!messages || messages.length === 0) return (
    <div className="text-center p-8">
      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
      <p className="text-muted-foreground text-sm">Aucun message échangé</p>
    </div>
  );

  return (
    <div className="p-4 space-y-1">
      {/* Participants legend */}
      <div className="flex gap-4 pb-3 mb-3 border-b border-border text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="text-muted-foreground">Acheteur: {getName(tx.buyer_profile)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-foreground/60" />
          <span className="text-muted-foreground">Vendeur: {getName(tx.seller_profile)}</span>
        </div>
      </div>

      {messages.map(msg => {
        const isBuyer = msg.sender_id === tx.buyer_id;
        const senderProfile = profiles?.get(msg.sender_id);
        const senderName = senderProfile?.full_name || senderProfile?.email || 'Inconnu';

        return (
          <div key={msg.id} className={cn("flex flex-col max-w-[85%] mb-2", isBuyer ? "items-start" : "items-end ml-auto")}>
            <span className="text-[10px] text-muted-foreground mb-0.5 px-1">
              {senderName} · {format(new Date(msg.created_at), 'dd MMM HH:mm', { locale: fr })}
            </span>
            <div className={cn(
              "rounded-2xl px-3 py-2 text-sm",
              isBuyer
                ? "bg-primary/10 text-foreground rounded-tl-sm"
                : "bg-secondary text-foreground rounded-tr-sm"
            )}>
              {msg.content}
            </div>
            {(msg.flagged_suspicious || msg.contains_phone_number) && (
              <div className="flex gap-1 mt-0.5 px-1">
                {msg.flagged_suspicious && (
                  <span className="text-[10px] bg-destructive/20 text-destructive px-1.5 py-0.5 rounded">⚠ Suspect</span>
                )}
                {msg.contains_phone_number && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">📱 Téléphone</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
