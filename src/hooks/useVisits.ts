import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useVisits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const visits = useQuery({
    queryKey: ['visits', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select(`*, properties (id, adresse, prix, type, prix_currency)`)
        .or(`buyer_id.eq.${user!.id},owner_id.eq.${user!.id}`)
        .order('proposed_date', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const requestVisit = useMutation({
    mutationFn: async (visit: { property_id: string; owner_id: string; proposed_date: string; message?: string }) => {
      // 1. Insert the visit request
      const { error } = await supabase.from('visits').insert({
        ...visit,
        buyer_id: user!.id,
      });
      if (error) throw error;

      // 2. Send the message to the conversation if provided
      if (visit.message?.trim()) {
        // Find or create conversation for this property
        let conversationId: string | null = null;

        const { data: existing } = await supabase
          .from('conversations')
          .select('id')
          .eq('property_id', visit.property_id)
          .eq('buyer_id', user!.id)
          .eq('owner_id', visit.owner_id)
          .maybeSingle();

        if (existing) {
          conversationId = existing.id;
        } else {
          const { data: created, error: createErr } = await supabase
            .from('conversations')
            .insert({
              property_id: visit.property_id,
              buyer_id: user!.id,
              owner_id: visit.owner_id,
            })
            .select('id')
            .single();
          if (createErr) throw createErr;
          conversationId = created.id;
        }

        // Format the visit date for the message
        const visitDate = new Date(visit.proposed_date);
        const dateStr = visitDate.toLocaleDateString('fr-FR', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        });

        const chatMessage = `📅 Demande de visite pour le ${dateStr}\n\n${visit.message}`;

        await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: user!.id,
          content: chatMessage,
        });

        // Update conversation timestamp
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversationId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const updateVisitStatus = useMutation({
    mutationFn: async ({ id, status, cancel_reason }: { id: string; status: string; cancel_reason?: string }) => {
      const { error } = await supabase
        .from('visits')
        .update({ status: status as any, cancel_reason })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visits'] }),
  });

  return { visits, requestVisit, updateVisitStatus };
}
