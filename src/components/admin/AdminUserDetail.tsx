import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, Calendar, Building2, Heart, MessageSquare, FileText, Home, Award, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { CertifiedBadge } from '@/components/ui/CertifiedBadge';

interface AdminUserDetailProps {
  userId: string;
  onBack: () => void;
}

export function AdminUserDetail({ userId, onBack }: AdminUserDetailProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: async () => {
      const [profileRes, rolesRes, scoresRes, matchesRes, conversationsRes, propertiesRes, transactionsRes, visitsRes, favoritesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('user_roles').select('role').eq('user_id', userId),
        supabase.from('wf_user_scores').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('matches').select('id', { count: 'exact', head: true }).or(`user_id.eq.${userId},owner_id.eq.${userId}`),
        supabase.from('conversations').select('id', { count: 'exact', head: true }).or(`buyer_id.eq.${userId},owner_id.eq.${userId}`),
        supabase.from('properties').select('id, type, adresse, prix, prix_currency, status, is_published', { count: 'exact' }).eq('owner_id', userId),
        supabase.from('wf_transactions').select('id, status', { count: 'exact' }).or(`buyer_id.eq.${userId},seller_id.eq.${userId}`),
        supabase.from('visits').select('id, status', { count: 'exact', head: true }).or(`buyer_id.eq.${userId},owner_id.eq.${userId}`),
        supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      ]);

      const transactions = transactionsRes.data || [];
      const txStats = {
        total: transactions.length,
        active: transactions.filter(t => !['deal_finalized', 'deal_cancelled', 'archived'].includes(t.status)).length,
        finalized: transactions.filter(t => t.status === 'deal_finalized').length,
        cancelled: transactions.filter(t => t.status === 'deal_cancelled').length,
      };

      return {
        profile: profileRes.data,
        roles: rolesRes.data?.map(r => r.role) || [],
        score: scoresRes.data,
        matchesCount: matchesRes.count || 0,
        conversationsCount: conversationsRes.count || 0,
        properties: propertiesRes.data || [],
        propertiesCount: propertiesRes.count || 0,
        txStats,
        visitsCount: visitsRes.count || 0,
        favoritesCount: favoritesRes.count || 0,
      };
    },
    enabled: !!userId,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (!data?.profile) return (
    <div className="p-4">
      <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1" />Retour</Button>
      <p className="text-center text-muted-foreground mt-4">Utilisateur introuvable</p>
    </div>
  );

  const { profile, roles, score, matchesCount, conversationsCount, propertiesCount, txStats, visitsCount, favoritesCount, properties } = data;
  const isOwner = roles.includes('owner');

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-1" /> Retour aux utilisateurs
      </Button>

      {/* Profile header */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start gap-4">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover border-2 border-border" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-foreground">
                {profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Sans nom'}
              </h2>
              {score?.certified && <CertifiedBadge />}
            </div>
            <div className="flex gap-1 mt-1 flex-wrap">
              {roles.map(role => (
                <Badge key={role} variant={role === 'admin' ? 'destructive' : role === 'owner' ? 'default' : 'secondary'} className="text-xs">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          {profile.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span>{profile.email}</span>
            </div>
          )}
          {profile.whatsapp && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>{profile.whatsapp}</span>
            </div>
          )}
          {profile.birth_date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>{format(new Date(profile.birth_date), 'dd MMMM yyyy', { locale: fr })}</span>
            </div>
          )}
          {profile.company_name && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span>{profile.company_name}{profile.company_address ? ` — ${profile.company_address}` : ''}</span>
            </div>
          )}
          {profile.bio && (
            <p className="text-muted-foreground bg-secondary/50 rounded-lg p-2 mt-2 text-xs">{profile.bio}</p>
          )}
          <p className="text-xs text-muted-foreground/60">
            Inscrit le {format(new Date(profile.created_at), 'dd MMMM yyyy', { locale: fr })} · Dernière mise à jour {format(new Date(profile.updated_at), 'dd MMM yyyy', { locale: fr })}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard icon={Heart} label="Matches" value={matchesCount} />
        <StatCard icon={MessageSquare} label="Conversations" value={conversationsCount} />
        <StatCard icon={Calendar} label="Visites" value={visitsCount} />
        <StatCard icon={FileText} label="Transactions" value={txStats.total} />
        <StatCard icon={Award} label="Score" value={score?.score ?? '—'} suffix="/100" />
        {isOwner && <StatCard icon={Home} label="Biens" value={propertiesCount} />}
      </div>

      {/* Transactions breakdown */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold text-foreground text-sm mb-3">Détail transactions</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground">En cours: <span className="font-medium text-foreground">{txStats.active}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-accent" />
            <span className="text-muted-foreground">Finalisées: <span className="font-medium text-foreground">{txStats.finalized}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Annulées: <span className="font-medium text-foreground">{txStats.cancelled}</span></span>
          </div>
        </div>
      </div>

      {/* Score detail */}
      {score && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold text-foreground text-sm mb-3">Détail score</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-muted-foreground">No-shows: <span className="font-medium text-foreground">{score.no_shows}</span></div>
            <div className="text-muted-foreground">Refus visites: <span className="font-medium text-foreground">{score.visit_refusals}</span></div>
            <div className="text-muted-foreground">VIP: <span className="font-medium text-foreground">{score.vip_access ? 'Oui' : 'Non'}</span></div>
            <div className="text-muted-foreground">Certifié: <span className="font-medium text-foreground">{score.certified ? 'Oui' : 'Non'}</span></div>
          </div>
        </div>
      )}

      {/* Properties list (if owner) */}
      {isOwner && properties.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold text-foreground text-sm mb-3">Biens ({propertiesCount})</h3>
          <div className="space-y-2">
            {properties.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">{p.type}</p>
                  <p className="text-xs text-muted-foreground">{p.adresse}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary">{p.prix?.toLocaleString()} {p.prix_currency}</span>
                  <Badge variant={p.is_published ? 'default' : 'secondary'} className="text-xs">
                    {p.is_published ? 'Publié' : 'Brouillon'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorites count */}
      <div className="text-xs text-muted-foreground text-center">
        ❤️ {favoritesCount} favoris · Devise préférée: {profile.preferred_currency}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, suffix }: { icon: any; label: string; value: number | string; suffix?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 text-center">
      <Icon className="h-5 w-5 text-primary mx-auto mb-1" />
      <div className="text-xl font-bold text-foreground">{value}{suffix}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
