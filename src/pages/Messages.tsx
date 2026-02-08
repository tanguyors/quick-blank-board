import { AppLayout } from '@/components/layout/AppLayout';
import { ConversationList } from '@/components/messages/ConversationList';

export default function Messages() {
  return (
    <AppLayout hideHeader>
      <div className="p-4 pb-0"><h1 className="text-xl font-bold">Messages</h1></div>
      <ConversationList />
    </AppLayout>
  );
}
