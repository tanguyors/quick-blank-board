import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { VisitList } from '@/components/visits/VisitList';
import { CalendarDays } from 'lucide-react';

export default function Visits() {
  return (
    <AppLayout hideHeader>
      <PageTopBar>
        <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span className="text-foreground font-semibold">Visites</span>
        </div>
      </PageTopBar>
      <VisitList />
    </AppLayout>
  );
}
