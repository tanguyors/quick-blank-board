import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { PropertyList } from '@/components/properties/PropertyList';
import { VisitList } from '@/components/visits/VisitList';
import { ConversationList } from '@/components/messages/ConversationList';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { TransactionStatusBadge } from '@/components/workflow/TransactionStatus';
import { Home, CalendarDays, MessageSquare, User, FileText, MapPin, ArrowRight, TrendingUp } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import type { TransactionStatus } from '@/types/workflow';

const TABS = [
  { id: 'biens', label: 'Mes biens', icon: Home },
  { id: 'transactions', label: 'Transactions', icon: FileText },
  { id: 'visites', label: 'Visites', icon: CalendarDays },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'profil', label: 'Profil', icon: User },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(tabParam || 'biens');

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <AppLayout hideHeader>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold text-2xl">𝔫</span>
            <span className="text-foreground font-semibold">SomaGate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Espace propriétaire</span>
            <NotificationBell />
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-border overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors whitespace-nowrap min-w-0 ${
                  isActive
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          {activeTab === 'biens' && <PropertyList />}
          {activeTab === 'transactions' && <OwnerTransactionsTab />}
          {activeTab === 'visites' && <VisitList />}
          {activeTab === 'messages' && <ConversationList />}
          {activeTab === 'profil' && <ProfileForm />}
        </div>
      </div>
    </AppLayout>
  );
}

function OwnerTransactionsTab() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['owner-transactions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wf_transactions')
        .select('*')
        .eq('seller_id', user!.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;

      const propertyIds = [...new Set(data.map(t => t.property_id))];
      const buyerIds = [...new Set(data.map(t => t.buyer_id))];

      const [propsRes, buyersRes] = await Promise.all([
        supabase.from('properties').select('id, type, adresse, prix, prix_currency, property_media(url, is_primary)').in('id', propertyIds),
        supabase.from('profiles').select('id, full_name, email').in('id', buyerIds),
      ]);

      const propMap = new Map(propsRes.data?.map(p => [p.id, p]) || []);
      const buyerMap = new Map(buyersRes.data?.map(b => [b.id, b]) || []);

      return data.map(t => ({
        ...t,
        property: propMap.get(t.property_id),
        buyer_profile: buyerMap.get(t.buyer_id),
      }));
    },
    enabled: !!user,
  });

  const active = transactions?.filter(t => !['deal_finalized', 'deal_cancelled', 'archived'].includes(t.status)) || [];
  const completed = transactions?.filter(t => ['deal_finalized', 'deal_cancelled', 'archived'].includes(t.status)) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  if (!transactions?.length) {
    return (
      <div className="text-center py-12 px-4">
        <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
        <p className="text-muted-foreground">Aucune transaction</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Les transactions apparaîtront quand des acheteurs matchent vos biens.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-foreground">{active.length}</p>
          <p className="text-[10px] text-muted-foreground">En cours</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-foreground">{completed.filter(t => t.status === 'deal_finalized').length}</p>
          <p className="text-[10px] text-muted-foreground">Finalisées</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-foreground">{transactions.length}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
      </div>

      {/* Active */}
      {active.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> En cours ({active.length})
          </h3>
          <div className="space-y-2">
            {active.map(tx => (
              <TransactionCard key={tx.id} tx={tx} onClick={() => navigate(`/transaction/${tx.id}`)} />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h3 className="font-semibold text-muted-foreground text-sm mb-3">Terminées ({completed.length})</h3>
          <div className="space-y-2">
            {completed.map(tx => (
              <TransactionCard key={tx.id} tx={tx} onClick={() => navigate(`/transaction/${tx.id}`)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TransactionCard({ tx, onClick }: { tx: any; onClick: () => void }) {
  const media = tx.property?.property_media?.find((m: any) => m.is_primary) || tx.property?.property_media?.[0];

  return (
    <button
      onClick={onClick}
      className="w-full bg-card border border-border rounded-xl overflow-hidden flex text-left hover:border-primary/30 transition-colors"
    >
      {media && (
        <img src={media.url} alt="" className="w-20 h-20 object-cover flex-shrink-0" />
      )}
      <div className="flex-1 p-3 min-w-0">
        <p className="text-sm font-medium text-foreground capitalize truncate">
          {tx.property?.type || 'Bien'} — {tx.property?.adresse}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Acheteur: {tx.buyer_profile?.full_name || tx.buyer_profile?.email || '—'}
        </p>
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
}
