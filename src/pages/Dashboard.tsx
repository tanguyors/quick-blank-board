import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { OwnerProfileHeader } from '@/components/dashboard/OwnerProfileHeader';
import { OwnerPropertyTab } from '@/components/dashboard/OwnerPropertyTab';
import { OwnerVisitsTab } from '@/components/dashboard/OwnerVisitsTab';
import { OwnerMessagesTab } from '@/components/dashboard/OwnerMessagesTab';
import { OwnerProfileTab } from '@/components/dashboard/OwnerProfileTab';
import { Home } from 'lucide-react';

type TabId = 'biens' | 'visites' | 'messages' | 'profil';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabId) || 'biens';

  return (
    <AppLayout hideHeader>
      {/* Un seul scroll : celui de <main> (évite deux zones qui se « volent » les gestes sur mobile). */}
      <div className="flex min-h-0 flex-col">
        <PageTopBar>
          <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
            <Home className="h-4 w-4 text-primary" />
            <span className="text-foreground font-semibold">Dashboard</span>
          </div>
        </PageTopBar>

        {/* Profile header with bio - always visible */}
        <OwnerProfileHeader />

        <div className="pb-nav-scroll">
          {activeTab === 'biens' && <OwnerPropertyTab />}
          {activeTab === 'visites' && <OwnerVisitsTab />}
          {activeTab === 'messages' && <OwnerMessagesTab />}
          {activeTab === 'profil' && <OwnerProfileTab />}
        </div>
      </div>
    </AppLayout>
  );
}
