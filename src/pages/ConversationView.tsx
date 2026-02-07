import { ChatView } from '@/components/messages/ChatView';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ConversationView() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate('/messages')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold">Conversation</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatView conversationId={id!} />
      </div>
    </div>
  );
}
