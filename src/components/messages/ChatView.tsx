import { useState, useRef, useEffect } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { toast } from 'sonner';

interface ChatViewProps {
  conversationId: string;
}

export function ChatView({ conversationId }: ChatViewProps) {
  const { messages, sendMessage } = useMessages(conversationId);
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages.data]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const result = await sendMessage.mutateAsync(newMessage.trim());
      setNewMessage('');
      if (result?.suspicious) {
        toast.warning(
          `⚠️ Message suspect détecté (${result.matchedKeywords?.join(', ')}). Nous vous rappelons que tous les échanges doivent rester sur la plateforme SomaGate pour votre protection.`,
          { duration: 8000 }
        );
      }
    } catch (error: any) {
      if (error?.message === 'PHONE_DETECTED') {
        toast.error(
          'Votre message contient un numéro de téléphone. Pour votre sécurité, les échanges de coordonnées personnelles ne sont pas autorisés sur SomaGate.',
          { duration: 8000 }
        );
      } else {
        toast.error("Erreur lors de l'envoi du message.");
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Security banner */}
      <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-start gap-2">
        <ShieldAlert className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
        <p className="text-xs text-destructive">
          SomaGate centralise et conserve l'ensemble des échanges. Les échanges de coordonnées personnelles sont interdits. En cas de litige, SOMA GATE conserve l'historique complet du projet.
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.data?.map(msg => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {format(new Date(msg.created_at), 'HH:mm', { locale: fr })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
        <Input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Votre message..."
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={sendMessage.isPending || !newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
