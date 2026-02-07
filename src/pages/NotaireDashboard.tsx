import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { TransactionStatusBadge } from '@/components/workflow/TransactionStatus';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Scale, FileText, CheckCircle, Clock, Search, Users,
  TrendingUp, AlertTriangle, ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import type { TransactionStatus } from '@/types/workflow';

type NotaireTab = 'overview' | 'documents' | 'transactions';

export default function NotaireDashboard() {
  const { roles, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<NotaireTab>('overview');

  if (loading) return null;

  const tabs: { id: NotaireTab; label: string; icon: typeof Scale }[] = [
    { id: 'overview', label: 'Tableau de bord', icon: TrendingUp },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'transactions', label: 'Dossiers', icon: Scale },
  ];

  return (
    <AppLayout hideHeader>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Espace Notaire</span>
          </div>
          <NotificationBell />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
                  activeTab === tab.id
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
        <div className="flex-1 overflow-y-auto pb-24">
          {activeTab === 'overview' && <NotaireOverview />}
          {activeTab === 'documents' && <NotaireDocuments />}
          {activeTab === 'transactions' && <NotaireTransactions />}
        </div>
      </div>
    </AppLayout>
  );
}

function NotaireOverview() {
  const stats = useQuery({
    queryKey: ['notaire-stats'],
    queryFn: async () => {
      const [docsRes, pendingDocsRes, txRes, finalizedRes] = await Promise.all([
        supabase.from('wf_documents').select('id', { count: 'exact', head: true }),
        supabase.from('wf_documents').select('id', { count: 'exact', head: true }).eq('is_final', false),
        supabase.from('wf_transactions').select('id', { count: 'exact', head: true })
          .in('status', ['documents_generated', 'in_validation', 'offer_made']),
        supabase.from('wf_transactions').select('id', { count: 'exact', head: true })
          .eq('status', 'deal_finalized'),
      ]);
      return {
        totalDocs: docsRes.count || 0,
        pendingDocs: pendingDocsRes.count || 0,
        activeDossiers: txRes.count || 0,
        finalized: finalizedRes.count || 0,
      };
    },
  });

  const recentDocs = useQuery({
    queryKey: ['notaire-recent-docs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('wf_documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const cards = [
    { label: 'Dossiers actifs', value: stats.data?.activeDossiers, icon: Scale, color: 'text-primary' },
    { label: 'Documents en attente', value: stats.data?.pendingDocs, icon: Clock, color: 'text-yellow-500' },
    { label: 'Total documents', value: stats.data?.totalDocs, icon: FileText, color: 'text-muted-foreground' },
    { label: 'Deals finalisés', value: stats.data?.finalized, icon: CheckCircle, color: 'text-green-500' },
  ];

  return (
    <div className="p-4 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map(card => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-4">
            <card.icon className={`h-5 w-5 ${card.color} mb-2`} />
            <div className="text-2xl font-bold text-foreground">{card.value ?? '—'}</div>
            <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Documents */}
      <div>
        <h3 className="font-semibold text-foreground text-sm mb-3">Documents récents</h3>
        <div className="space-y-2">
          {recentDocs.data?.map(doc => (
            <div key={doc.id} className="bg-card border border-border rounded-xl p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{doc.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 capitalize">{doc.type.replace('_', ' ')}</p>
                </div>
                <div className="flex gap-1">
                  {doc.buyer_validated && (
                    <span className="text-[10px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded-full">Acheteur ✓</span>
                  )}
                  {doc.seller_validated && (
                    <span className="text-[10px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded-full">Vendeur ✓</span>
                  )}
                  {!doc.buyer_validated && !doc.seller_validated && (
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded-full">En attente</span>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                {format(new Date(doc.created_at), 'dd MMM yyyy', { locale: fr })}
              </p>
            </div>
          ))}
          {(!recentDocs.data || recentDocs.data.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-6">Aucun document</p>
          )}
        </div>
      </div>
    </div>
  );
}

function NotaireDocuments() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'validated'>('all');

  const documents = useQuery({
    queryKey: ['notaire-all-docs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('wf_documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      return data || [];
    },
  });

  const filtered = documents.data?.filter(doc => {
    if (filter === 'pending' && (doc.buyer_validated && doc.seller_validated)) return false;
    if (filter === 'validated' && (!doc.buyer_validated || !doc.seller_validated)) return false;
    if (search) {
      const s = search.toLowerCase();
      return doc.title.toLowerCase().includes(s) || doc.type.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un document..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'pending', 'validated'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : 'Validés'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered?.map(doc => {
          const bothValidated = doc.buyer_validated && doc.seller_validated;
          return (
            <div key={doc.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{doc.title}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">{doc.type.replace('_', ' ')}</p>
                </div>
                {bothValidated ? (
                  <Badge className="bg-green-500/20 text-green-500 border-0 text-xs">Complet</Badge>
                ) : (
                  <Badge className="bg-yellow-500/20 text-yellow-500 border-0 text-xs">En cours</Badge>
                )}
              </div>

              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {doc.buyer_validated ? '✓' : '✗'} Acheteur
                </span>
                <span className="flex items-center gap-1">
                  {doc.seller_validated ? '✓' : '✗'} Vendeur
                </span>
                <span>v{doc.version || 1}</span>
                <span>{format(new Date(doc.created_at), 'dd/MM/yy', { locale: fr })}</span>
              </div>

              {!bothValidated && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-yellow-500">
                  <AlertTriangle className="h-3 w-3" />
                  En attente de validation
                </div>
              )}
            </div>
          );
        })}
        {(!filtered || filtered.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-8">Aucun document trouvé</p>
        )}
      </div>
    </div>
  );
}

function NotaireTransactions() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const transactions = useQuery({
    queryKey: ['notaire-transactions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('wf_transactions')
        .select('*')
        .in('status', [
          'offer_made', 'documents_generated', 'in_validation', 'deal_finalized',
        ])
        .order('updated_at', { ascending: false })
        .limit(100);

      if (!data || data.length === 0) return [];

      const allUserIds = [...new Set(data.flatMap(t => [t.buyer_id, t.seller_id]))];
      const propertyIds = [...new Set(data.map(t => t.property_id))];

      const [profilesRes, propsRes, docsRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email').in('id', allUserIds),
        supabase.from('properties').select('id, type, adresse, prix, prix_currency').in('id', propertyIds),
        supabase.from('wf_documents').select('transaction_id, buyer_validated, seller_validated').in('transaction_id', data.map(t => t.id)),
      ]);

      const profileMap = new Map(profilesRes.data?.map(p => [p.id, p]) || []);
      const propMap = new Map(propsRes.data?.map(p => [p.id, p]) || []);

      // Count docs per transaction
      const docsCountMap = new Map<string, { total: number; validated: number }>();
      docsRes.data?.forEach(d => {
        const curr = docsCountMap.get(d.transaction_id) || { total: 0, validated: 0 };
        curr.total++;
        if (d.buyer_validated && d.seller_validated) curr.validated++;
        docsCountMap.set(d.transaction_id, curr);
      });

      return data.map(t => ({
        ...t,
        buyer_profile: profileMap.get(t.buyer_id),
        seller_profile: profileMap.get(t.seller_id),
        property: propMap.get(t.property_id),
        docs: docsCountMap.get(t.id) || { total: 0, validated: 0 },
      }));
    },
  });

  const filtered = transactions.data?.filter(t => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      t.buyer_profile?.full_name?.toLowerCase().includes(s) ||
      t.seller_profile?.full_name?.toLowerCase().includes(s) ||
      t.property?.adresse?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un dossier..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      <div className="space-y-2">
        {filtered?.map(tx => (
          <button
            key={tx.id}
            onClick={() => navigate(`/transaction/${tx.id}`)}
            className="w-full bg-card border border-border rounded-xl p-4 text-left hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground capitalize truncate">
                  {tx.property?.type} — {tx.property?.adresse}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {tx.buyer_profile?.full_name || tx.buyer_profile?.email || 'Acheteur'}
                  {' ↔ '}
                  {tx.seller_profile?.full_name || tx.seller_profile?.email || 'Vendeur'}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
            </div>

            <div className="flex items-center gap-3 mt-2">
              <TransactionStatusBadge status={tx.status as TransactionStatus} />
              <span className="text-xs text-muted-foreground">
                {tx.docs.validated}/{tx.docs.total} docs validés
              </span>
            </div>

            {tx.offer_amount && (
              <p className="text-xs text-primary font-medium mt-1.5">
                Offre: {tx.offer_amount.toLocaleString()} {tx.property?.prix_currency || 'IDR'}
              </p>
            )}
          </button>
        ))}
        {(!filtered || filtered.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-8">Aucun dossier trouvé</p>
        )}
      </div>
    </div>
  );
}
