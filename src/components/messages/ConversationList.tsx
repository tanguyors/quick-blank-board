import { useConversations } from '@/hooks/useConversations';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

export function ConversationList() {
  const { data: conversations, isLoading } = useConversations();
  const navigate = useNavigate();

  if (isLoading) return <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!conversations?.length) return <div className="text-center p-8 text-muted-foreground">Aucune conversation</div>;

  return (
    <div className="divide-y divide-border">
      {conversations.map((conv: any) => {
        const property = conv.properties;
        const other = conv.otherProfile;
        return (
          <button
            key={conv.id}
            onClick={() => navigate(`/messages/${conv.id}`)}
            className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
          >
            <Avatar>
              <AvatarImage src={other?.avatar_url || ''} />
              <AvatarFallback>{other?.full_name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{other?.full_name || 'Utilisateur'}</p>
              <p className="text-sm text-muted-foreground truncate">{property?.adresse}</p>
            </div>
            <span className="text-xs text-muted-foreground">
              {format(new Date(conv.last_message_at), 'dd/MM', { locale: fr })}
            </span>
          </button>
        );
      })}
    </div>
  );
}
