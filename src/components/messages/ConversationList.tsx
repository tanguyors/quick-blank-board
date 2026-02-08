import { useConversations } from '@/hooks/useConversations';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

export function ConversationList() {
  const { data: conversations, isLoading } = useConversations();
  const { displayPrice } = useDisplayPrice();
  const navigate = useNavigate();

  if (isLoading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (!conversations?.length) return (
    <div className="text-center p-8 text-muted-foreground">Aucune conversation</div>
  );

  return (
    <div className="divide-y divide-border">
      {conversations.map((conv: any) => {
        const property = conv.properties;
        const primaryMedia = property?.property_media?.find((m: any) => m.is_primary) || property?.property_media?.[0];

        return (
          <button
            key={conv.id}
            onClick={() => navigate(`/messages/${conv.id}`)}
            className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
          >
            {/* Property thumbnail */}
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
              {primaryMedia ? (
                <img src={primaryMedia.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                  📷
                </div>
              )}
            </div>

            {/* Property info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-foreground text-sm truncate capitalize">
                  {property?.type || 'Bien'}
                </p>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {format(new Date(conv.last_message_at), 'dd/MM', { locale: fr })}
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="text-xs truncate">{property?.adresse}</span>
              </div>
              <p className="text-xs font-medium text-primary mt-1">
                {property?.prix ? displayPrice(property.prix, property.prix_currency) : ''}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
