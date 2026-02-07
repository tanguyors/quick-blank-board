import { AppLayout } from '@/components/layout/AppLayout';
import { MatchList } from '@/components/matches/MatchList';

export default function Matches() {
  return (
    <AppLayout>
      <div className="p-4 pb-0"><h1 className="text-xl font-bold">Mes matches</h1></div>
      <MatchList />
    </AppLayout>
  );
}
