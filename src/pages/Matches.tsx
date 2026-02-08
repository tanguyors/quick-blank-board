import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { MatchList } from '@/components/matches/MatchList';
import { useMatches } from '@/hooks/useMatches';
import { Heart, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function Matches() {
  const { data: matches } = useMatches();
  const queryClient = useQueryClient();

  return (
    <AppLayout hideHeader>
      <div className="flex flex-col h-full">
        {/* Header */}
        <PageTopBar>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
              <Heart className="h-4 w-4 text-primary fill-primary" />
              <span className="text-foreground font-semibold">Matches</span>
            </div>
            {matches?.length ? (
              <div className="flex items-center gap-1.5 bg-primary/20 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
                <Heart className="h-4 w-4 fill-current" />
                {matches.length}
              </div>
            ) : null}
          </div>
        </PageTopBar>

        <MatchList />
      </div>
    </AppLayout>
  );
}
