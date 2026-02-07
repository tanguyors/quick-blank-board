import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PropertyList } from '@/components/properties/PropertyList';
import { VisitList } from '@/components/visits/VisitList';
import { ConversationList } from '@/components/messages/ConversationList';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { Home, CalendarDays, MessageSquare, User } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const TABS = [
  { id: 'biens', label: 'Mes biens', icon: Home },
  { id: 'visites', label: 'Visites', icon: CalendarDays },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'profil', label: 'Profil', icon: User },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(tabParam || 'biens');

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <AppLayout hideHeader>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold text-2xl">𝔫</span>
            <span className="text-foreground font-semibold">SomaGate</span>
          </div>
          <span className="text-xs text-muted-foreground">Espace propriétaire</span>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-border">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'biens' && <PropertyList />}
          {activeTab === 'visites' && <VisitList />}
          {activeTab === 'messages' && <ConversationList />}
          {activeTab === 'profil' && <ProfileForm />}
        </div>
      </div>
    </AppLayout>
  );
}
