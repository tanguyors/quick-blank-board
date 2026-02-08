import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { ConversationList } from '@/components/messages/ConversationList';
import { MessageSquare } from 'lucide-react';

export default function Messages() {
  return (
    <AppLayout hideHeader>
      <PageTopBar>
        <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="text-foreground font-semibold">Messages</span>
        </div>
      </PageTopBar>
      <ConversationList />
    </AppLayout>
  );
}
