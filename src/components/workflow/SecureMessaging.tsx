import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { SecurityBanner } from './SecurityAlert';
import { toast } from 'sonner';
import type { WfMessage } from '@/types/workflow';

interface SecureMessagingProps {
  messages: WfMessage[];
  onSendMessage: (content: string) => Promise<{ success: boolean; blocked?: boolean; reason?: string; suspicious?: boolean }>;
  isSending: boolean;
}

export function SecureMessaging({ messages, onSendMessage, isSending }: SecureMessagingProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage('');

    try {
      const result = await onSendMessage(content);
      if (result.blocked) {
        toast.error(result.reason || 'Message bloqué');
        setNewMessage(content); // Restore message
      } else if (result.suspicious) {
        toast.warning('⚠️ Votre message a été envoyé mais contient des termes suspects. Rappel: tous les échanges doivent rester sur la plateforme.');
      }
    } catch (error: any) {
      toast.error(error.message);
      setNewMessage(content);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Security banner */}
      <div className="p-3">
        <SecurityBanner type="no_phone_exchange" />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground text-sm">Messagerie sécurisée</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Vos échanges sont protégés par SomaGate</p>
          </div>
        )}

        {messages.map(msg => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                isMe ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'
              }`}>
                {msg.flagged_suspicious && (
                  <div className="flex items-center gap-1 mb-1">
                    <Shield className="h-3 w-3 text-amber-400" />
                    <span className="text-xs text-amber-400">Suspect</span>
                  </div>
                )}
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {format(new Date(msg.created_at), 'HH:mm', { locale: fr })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
        <Input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Votre message sécurisé..."
          className="flex-1 bg-card border-border"
        />
        <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
