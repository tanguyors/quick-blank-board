import { AppLayout } from '@/components/layout/AppLayout';
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
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
              <span className="text-primary font-bold text-lg">𝔫</span>
              <span className="text-foreground font-semibold">Favoris</span>
            </div>
            {matches?.length ? (
              <div className="flex items-center gap-1.5 bg-destructive/20 text-destructive px-3 py-1.5 rounded-full text-sm font-medium">
                <Heart className="h-4 w-4 fill-current" />
                {matches.length}
              </div>
            ) : null}
          </div>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['matches'] })}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        <MatchList />
      </div>
    </AppLayout>
  );
}
