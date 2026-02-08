import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { OwnerProfileHeader } from '@/components/dashboard/OwnerProfileHeader';
import { OwnerPropertyTab } from '@/components/dashboard/OwnerPropertyTab';
import { OwnerVisitsTab } from '@/components/dashboard/OwnerVisitsTab';
import { OwnerMessagesTab } from '@/components/dashboard/OwnerMessagesTab';
import { OwnerProfileTab } from '@/components/dashboard/OwnerProfileTab';

type TabId = 'biens' | 'visites' | 'messages' | 'profil';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabId) || 'biens';

  return (
    <AppLayout hideHeader>
      <div className="flex flex-col h-full">
        {/* Profile header with bio - always visible */}
        <OwnerProfileHeader />

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          {activeTab === 'biens' && <OwnerPropertyTab />}
          {activeTab === 'visites' && <OwnerVisitsTab />}
          {activeTab === 'messages' && <OwnerMessagesTab />}
          {activeTab === 'profil' && <OwnerProfileTab />}
        </div>
      </div>
    </AppLayout>
  );
}
