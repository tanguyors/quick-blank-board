import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle, XCircle, Pencil } from 'lucide-react';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STATUS_FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'published', label: 'Publiés' },
  { value: 'draft', label: 'Brouillons' },
] as const;

export function AdminPropertiesTab() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const { displayPrice } = useDisplayPrice();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: properties, isLoading } = useQuery({
    queryKey: ['admin-all-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*, property_media(url, is_primary)')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;

      const ownerIds = [...new Set(data.map(p => p.owner_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', ownerIds);
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return data.map(p => ({
        ...p,
        owner_profile: profileMap.get(p.owner_id),
      }));
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase.from('properties').update({ is_published }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-properties'] });
      toast.success(vars.is_published ? 'Bien publié avec succès' : 'Publication retirée');
    },
  });

  const filtered = properties?.filter(p => {
    // Status filter
    if (filter === 'pending' && (p.is_published || p.status === 'draft')) return false;
    if (filter === 'published' && !p.is_published) return false;
    if (filter === 'draft' && p.status !== 'draft') return false;
    // For 'pending': show properties that are not published and not draft (awaiting validation)
    if (filter === 'pending' && p.status === 'draft') return false;
    if (filter === 'pending' && p.is_published) return false;

    if (search) {
      const s = search.toLowerCase();
      return (
        p.adresse.toLowerCase().includes(s) ||
        p.type.toLowerCase().includes(s) ||
        p.owner_profile?.full_name?.toLowerCase().includes(s) ||
        p.owner_profile?.email?.toLowerCase().includes(s)
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
        <Input placeholder="Rechercher bien, vendeur..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
      </div>

      <div className="overflow-x-auto scrollbar-hide border-b border-border">
        <div className="flex gap-1.5 px-4 py-2 min-w-max">
          {STATUS_FILTERS.map(f => (
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
          <p className="text-muted-foreground text-sm text-center py-8">Aucun bien trouvé</p>
        )}
        {filtered?.map(prop => {
          const media = prop.property_media?.find((m: any) => m.is_primary) || prop.property_media?.[0];
          const ownerName = prop.owner_profile?.full_name || prop.owner_profile?.email || 'Inconnu';
          return (
            <div key={prop.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex">
                {media && (
                  <img src={(media as any).url} alt="" className="w-24 h-24 object-cover flex-shrink-0" />
                )}
                <div className="p-3 flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground capitalize truncate">{prop.type}</p>
                      <p className="text-xs text-muted-foreground truncate">{prop.adresse}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Vendeur: {ownerName}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={prop.is_published ? 'default' : 'secondary'} className="text-xs">
                        {prop.is_published ? 'Publié' : prop.status === 'draft' ? 'Brouillon' : 'Non publié'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{prop.status}</Badge>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-primary mt-1">{displayPrice(prop.prix, prop.prix_currency)}</p>
                </div>
              </div>

              {/* Admin actions */}
              <div className="flex gap-2 px-3 pb-3">
                {!prop.is_published && (
                  <Button size="sm" className="flex-1 gap-1" onClick={() => togglePublish.mutate({ id: prop.id, is_published: true })}>
                    <CheckCircle className="h-3.5 w-3.5" /> Valider & Publier
                  </Button>
                )}
                {prop.is_published && (
                  <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => togglePublish.mutate({ id: prop.id, is_published: false })}>
                    <XCircle className="h-3.5 w-3.5" /> Retirer publication
                  </Button>
                )}
                <Button size="sm" variant="secondary" className="gap-1" onClick={() => navigate(`/properties/${prop.id}/edit`)}>
                  <Pencil className="h-3.5 w-3.5" /> Modifier
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
