import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Users, Building2, TrendingUp, FileText, Shield, Search, CalendarDays, Map, Mail, UserCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AdminUserDetail } from '@/components/admin/AdminUserDetail';
import { AdminVisitsTab } from '@/components/admin/AdminVisitsTab';
import { AdminPropertiesTab } from '@/components/admin/AdminPropertiesTab';
import { AdminTransactionsTab } from '@/components/admin/AdminTransactionsTab';
import { AdminOverviewTab } from '@/components/admin/AdminOverviewTab';
import { AdminNotificationsTab } from '@/components/admin/AdminNotificationsTab';
import { PropertyMap } from '@/components/map/PropertyMap';

type AdminTab = 'overview' | 'users' | 'transactions' | 'properties' | 'visits' | 'notifications' | 'map';

export default function Admin() {
  const { roles, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as AdminTab) || 'overview';
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (loading) return null;
  if (!roles.includes('admin')) return <Navigate to="/" replace />;

  const setActiveTab = (tab: AdminTab) => {
    setSearchParams({ tab });
    setSelectedUserId(null);
  };

  const tabs: { id: AdminTab; label: string; icon: typeof Users }[] = [
    { id: 'overview', label: 'Vue globale', icon: TrendingUp },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'properties', label: 'Biens', icon: Building2 },
    { id: 'visits', label: 'Visites', icon: CalendarDays },
    { id: 'transactions', label: 'Transactions', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Mail },
    { id: 'map', label: 'Carte', icon: Map },
  ];

  return (
    <AppLayout hideHeader>
      <div className="flex flex-col h-full">
        <PageTopBar>
          <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-foreground font-semibold">Administration</span>
          </div>
        </PageTopBar>

        <div className="flex border-b border-border overflow-x-auto scrollbar-hide">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const desktopOnly = tab.id === 'notifications';
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground'
                } ${desktopOnly ? 'hidden lg:flex' : 'flex'}`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && <AdminOverviewTab onNavigate={setActiveTab} />}
          {activeTab === 'users' && (
            selectedUserId
              ? <AdminUserDetail userId={selectedUserId} onBack={() => setSelectedUserId(null)} />
              : <UsersTab onSelectUser={setSelectedUserId} />
          )}
          {activeTab === 'properties' && <AdminPropertiesTab />}
          {activeTab === 'visits' && <AdminVisitsTab />}
          {activeTab === 'transactions' && <AdminTransactionsTab />}
          {activeTab === 'notifications' && <AdminNotificationsTab />}
          {activeTab === 'map' && (
            <div className="h-[calc(100vh-10rem)] w-full">
              <PropertyMap embedded />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function UsersTab({ onSelectUser }: { onSelectUser: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const users = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      const userIds = profiles?.map(p => p.id) || [];
      const [rolesRes, scoresRes] = await Promise.all([
        supabase.from('user_roles').select('user_id, role').in('user_id', userIds),
        supabase.from('wf_user_scores').select('user_id, score, certified').in('user_id', userIds),
      ]);

      const rolesMap: Record<string, string[]> = {};
      rolesRes.data?.forEach(r => {
        if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
        rolesMap[r.user_id].push(r.role);
      });

      const scoresMap: Record<string, any> = {};
      scoresRes.data?.forEach(s => { scoresMap[s.user_id] = s; });

      return profiles?.map(p => ({
        ...p,
        roles: rolesMap[p.id] || [],
        score: scoresMap[p.id],
      })) || [];
    },
  });

  const roleOptions = ['all', 'user', 'owner', 'admin', 'notaire', 'agent'];
  const roleLabels: Record<string, string> = {
    all: 'Tous',
    user: 'Utilisateur',
    owner: 'Propriétaire',
    admin: 'Admin',
    notaire: 'Notaire',
    agent: 'Agent',
  };

  const filtered = users.data?.filter(u => {
    if (roleFilter !== 'all' && !u.roles.includes(roleFilter)) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.first_name?.toLowerCase().includes(s) ||
      u.last_name?.toLowerCase().includes(s) ||
      u.roles.some(r => r.toLowerCase().includes(s))
    );
  });

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un utilisateur..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {roleOptions.map(role => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              roleFilter === role
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {roleLabels[role]}
            {role !== 'all' && users.data && (
              <span className="ml-1 opacity-70">
                ({users.data.filter(u => u.roles.includes(role)).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered?.map(user => (
          <div
            key={user.id}
            onClick={() => onSelectUser(user.id)}
            className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-foreground text-sm">
                  {user.full_name || user.first_name || user.email || 'Sans nom'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
              </div>
              <div className="flex gap-1 flex-wrap justify-end">
                {user.roles.map(role => (
                  <Badge key={role} variant={role === 'admin' ? 'destructive' : role === 'owner' ? 'default' : 'secondary'} className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>Score: {user.score?.score ?? '—'}/100</span>
              {user.score?.certified && <span className="text-primary font-medium">✓ Certifié</span>}
              <span>Inscrit: {new Date(user.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
