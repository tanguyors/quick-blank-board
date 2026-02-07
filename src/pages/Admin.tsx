import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Navigate } from 'react-router-dom';
import { Users, Building2, TrendingUp, FileText, Shield, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TransactionStatusBadge } from '@/components/workflow/TransactionStatus';
import type { TransactionStatus } from '@/types/workflow';

type AdminTab = 'overview' | 'users' | 'transactions' | 'properties';

export default function Admin() {
  const { roles, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  if (loading) return null;
  if (!roles.includes('admin')) return <Navigate to="/" replace />;

  const tabs: { id: AdminTab; label: string; icon: typeof Users }[] = [
    { id: 'overview', label: 'Vue globale', icon: TrendingUp },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: FileText },
    { id: 'properties', label: 'Biens', icon: Building2 },
  ];

  return (
    <AppLayout hideHeader>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Administration</span>
          </div>
        </div>

        <div className="flex border-b border-border overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
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

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'transactions' && <TransactionsTab />}
          {activeTab === 'properties' && <PropertiesTab />}
        </div>
      </div>
    </AppLayout>
  );
}

function OverviewTab() {
  const stats = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [usersRes, propsRes, txRes, matchesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('wf_transactions').select('id', { count: 'exact', head: true }),
        supabase.from('matches').select('id', { count: 'exact', head: true }),
      ]);
      return {
        users: usersRes.count || 0,
        properties: propsRes.count || 0,
        transactions: txRes.count || 0,
        matches: matchesRes.count || 0,
      };
    },
  });

  const recentTx = useQuery({
    queryKey: ['admin-recent-tx'],
    queryFn: async () => {
      const { data } = await supabase
        .from('wf_transactions')
        .select('id, status, created_at, buyer_id, seller_id')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const cards = [
    { label: 'Utilisateurs', value: stats.data?.users, icon: Users },
    { label: 'Biens', value: stats.data?.properties, icon: Building2 },
    { label: 'Transactions', value: stats.data?.transactions, icon: FileText },
    { label: 'Matches', value: stats.data?.matches, icon: TrendingUp },
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {cards.map(card => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-4">
            <card.icon className="h-5 w-5 text-primary mb-2" />
            <div className="text-2xl font-bold text-foreground">{card.value ?? '—'}</div>
            <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold text-foreground text-sm mb-3">Transactions récentes</h3>
        <div className="space-y-2">
          {recentTx.data?.map(tx => (
            <div key={tx.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
              <span className="text-muted-foreground font-mono text-xs">{tx.id.slice(0, 8)}...</span>
              <TransactionStatusBadge status={tx.status as TransactionStatus} />
            </div>
          ))}
          {(!recentTx.data || recentTx.data.length === 0) && (
            <p className="text-muted-foreground text-sm">Aucune transaction</p>
          )}
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const [search, setSearch] = useState('');

  const users = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      const userIds = profiles?.map(p => p.id) || [];
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const { data: scores } = await supabase
        .from('wf_user_scores')
        .select('user_id, score, certified')
        .in('user_id', userIds);

      const rolesMap = new Map<string, string[]>();
      roles?.forEach(r => {
        const arr = rolesMap.get(r.user_id) || [];
        arr.push(r.role);
        rolesMap.set(r.user_id, arr);
      });

      const scoresMap = new Map(scores?.map(s => [s.user_id, s]) || []);

      return profiles?.map(p => ({
        ...p,
        roles: rolesMap.get(p.id) || [],
        score: scoresMap.get(p.id),
      })) || [];
    },
  });

  const filtered = users.data?.filter(u => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.first_name?.toLowerCase().includes(s) ||
      u.last_name?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un utilisateur..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      <div className="space-y-2">
        {filtered?.map(user => (
          <div key={user.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-foreground text-sm">
                  {user.full_name || user.first_name || user.email || 'Sans nom'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
              </div>
              <div className="flex gap-1">
                {user.roles.map(role => (
                  <Badge key={role} variant={role === 'admin' ? 'destructive' : 'secondary'} className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>Score: {user.score?.score ?? '—'}/100</span>
              {user.score?.certified && (
                <span className="text-primary font-medium">✓ Certifié</span>
              )}
              <span>Inscrit: {new Date(user.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionsTab() {
  const [search, setSearch] = useState('');

  const transactions = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('wf_transactions')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(100);

      if (!data || data.length === 0) return [];

      const allUserIds = [...new Set(data.flatMap(t => [t.buyer_id, t.seller_id]))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', allUserIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const propertyIds = [...new Set(data.map(t => t.property_id))];
      const { data: properties } = await supabase
        .from('properties')
        .select('id, type, adresse')
        .in('id', propertyIds);

      const propMap = new Map(properties?.map(p => [p.id, p]) || []);

      return data.map(t => ({
        ...t,
        buyer_profile: profileMap.get(t.buyer_id),
        seller_profile: profileMap.get(t.seller_id),
        property: propMap.get(t.property_id),
      }));
    },
  });

  const filtered = transactions.data?.filter(t => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      t.status.includes(s) ||
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
          placeholder="Rechercher une transaction..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      <div className="space-y-2">
        {filtered?.map(tx => (
          <div key={tx.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground font-medium capitalize">
                  {tx.property?.type} — {tx.property?.adresse}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {tx.buyer_profile?.full_name || tx.buyer_profile?.email} ↔ {tx.seller_profile?.full_name || tx.seller_profile?.email}
                </p>
              </div>
              <TransactionStatusBadge status={tx.status as TransactionStatus} />
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>MAJ: {new Date(tx.updated_at).toLocaleDateString('fr-FR')}</span>
              {tx.offer_amount && <span className="text-primary font-medium">Offre: {tx.offer_amount.toLocaleString()} IDR</span>}
            </div>
          </div>
        ))}
        {(!filtered || filtered.length === 0) && (
          <p className="text-muted-foreground text-sm text-center py-8">Aucune transaction trouvée</p>
        )}
      </div>
    </div>
  );
}

function PropertiesTab() {
  const [search, setSearch] = useState('');

  const properties = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('*, property_media(url, is_primary)')
        .order('created_at', { ascending: false })
        .limit(100);
      return data || [];
    },
  });

  const filtered = properties.data?.filter(p => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.adresse.toLowerCase().includes(s) || p.type.toLowerCase().includes(s);
  });

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un bien..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      <div className="space-y-2">
        {filtered?.map(prop => {
          const media = prop.property_media?.find((m: any) => m.is_primary) || prop.property_media?.[0];
          return (
            <div key={prop.id} className="bg-card border border-border rounded-xl overflow-hidden flex">
              {media && (
                <img src={media.url} alt="" className="w-20 h-20 object-cover" />
              )}
              <div className="p-3 flex-1">
                <p className="text-sm font-medium text-foreground capitalize">{prop.type}</p>
                <p className="text-xs text-muted-foreground">{prop.adresse}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-primary">{prop.prix.toLocaleString()} {prop.prix_currency}</span>
                  <Badge variant={prop.is_published ? 'default' : 'secondary'} className="text-xs">
                    {prop.is_published ? 'Publié' : 'Brouillon'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{prop.status}</Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
