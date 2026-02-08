import { useConversations } from '@/hooks/useConversations';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { MessageSquare } from 'lucide-react';

export function OwnerMessagesTab() {
  const { data: conversations, isLoading } = useConversations();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const count = conversations?.length || 0;

  return (
    <div className="p-4">
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">Messages</h3>
          <p className="text-sm text-muted-foreground">{count} conversation{count !== 1 ? 's' : ''}</p>
        </div>

        {!conversations?.length ? (
          <div className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Aucune conversation pour le moment</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conv: any) => {
              const property = conv.properties;
              const other = conv.otherProfile;
              return (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/messages/${conv.id}`, { state: { from: '/dashboard?tab=messages' } })}
                  className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
                >
                  <Avatar>
                    <AvatarImage src={other?.avatar_url || ''} />
                    <AvatarFallback>{other?.full_name?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-foreground">{other?.full_name || 'Utilisateur'}</p>
                    <p className="text-sm text-muted-foreground truncate">{property?.adresse}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(conv.last_message_at), 'dd/MM', { locale: fr })}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
