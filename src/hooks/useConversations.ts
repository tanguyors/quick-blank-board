import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useConversations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`*, properties (id, adresse, prix, type, prix_currency, property_media (url, is_primary))`)
        .or(`buyer_id.eq.${user!.id},owner_id.eq.${user!.id}`)
        .order('last_message_at', { ascending: false });
      if (error) throw error;

      if (conversations && conversations.length > 0) {
        const otherIds = conversations.map(c =>
          c.buyer_id === user!.id ? c.owner_id : c.buyer_id
        );
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, first_name, last_name, avatar_url')
          .in('id', otherIds);

        return conversations.map(c => ({
          ...c,
          otherProfile: profiles?.find(p =>
            p.id === (c.buyer_id === user!.id ? c.owner_id : c.buyer_id)
          ) || null,
        }));
      }
      return conversations || [];
    },
    enabled: !!user,
  });
}
