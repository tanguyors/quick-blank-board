import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import { useAuth } from '@/hooks/useAuth';
import { ChatView } from '@/components/messages/ChatView';
import { ArrowLeft, MapPin } from 'lucide-react';

export default function ConversationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { displayPrice } = useDisplayPrice();
  const { roles } = useAuth();
  const isOwner = roles.includes('owner');

  // Determine back destination: use state if provided, otherwise role-based
  const backTo = (location.state as any)?.from || (isOwner ? '/dashboard?tab=messages' : '/messages');

  // Fetch conversation with property details
  const { data: conversation } = useQuery({
    queryKey: ['conversation-detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`*, properties (id, type, adresse, prix, prix_currency, property_media (url, is_primary))`)
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const property = conversation?.properties as any;
  const primaryMedia = property?.property_media?.find((m: any) => m.is_primary) || property?.property_media?.[0];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header with back button */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border flex-shrink-0">
        <button
          onClick={() => navigate(backTo)}
          className="p-2 text-foreground hover:text-foreground/70 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="font-semibold text-foreground text-sm">Conversation</span>
      </div>

      {/* Property summary banner */}
      {property && (
        <button
          onClick={() => navigate(`/properties/${property.id}`)}
          className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card hover:bg-accent/50 transition-colors text-left flex-shrink-0"
        >
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
            {primaryMedia ? (
              <img src={primaryMedia.url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">📷</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm capitalize truncate">{property.type}</p>
            <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="text-xs truncate">{property.adresse}</span>
            </div>
          </div>
          <span className="text-sm font-bold text-primary flex-shrink-0">
            {property.prix ? displayPrice(property.prix, property.prix_currency) : ''}
          </span>
        </button>
      )}

      {/* Chat */}
      <div className="flex-1 min-h-0">
        <ChatView conversationId={id!} />
      </div>
    </div>
  );
}
