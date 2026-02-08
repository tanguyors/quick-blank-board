import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { OwnerProfileHeader } from '@/components/dashboard/OwnerProfileHeader';
import { OwnerPropertyTab } from '@/components/dashboard/OwnerPropertyTab';
import { OwnerVisitsTab } from '@/components/dashboard/OwnerVisitsTab';
import { OwnerMessagesTab } from '@/components/dashboard/OwnerMessagesTab';
import { OwnerProfileTab } from '@/components/dashboard/OwnerProfileTab';
import { Home, CalendarDays, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'biens', label: 'Mes biens', icon: Home },
  { id: 'visites', label: 'Visites', icon: CalendarDays },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'profil', label: 'Profil', icon: User },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabId) || 'biens';

  const handleTabChange = (tab: TabId) => {
    setSearchParams({ tab });
  };

  return (
    <AppLayout hideHeader>
      <div className="flex flex-col h-full">
        {/* Profile header with bio - always visible */}
        <OwnerProfileHeader />

        {/* Tab bar - pill style */}
        <div className="mx-4 mt-4">
          <div className="bg-secondary/50 rounded-2xl p-1.5 flex gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-all",
                    isActive
                      ? "bg-card text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xs">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

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
