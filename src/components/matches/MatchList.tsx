import { useMatches } from '@/hooks/useMatches';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function MatchList() {
  const { data: matches, isLoading } = useMatches();
  const navigate = useNavigate();

  if (isLoading) return <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!matches?.length) return <div className="text-center p-8 text-muted-foreground">Aucun match pour le moment</div>;

  return (
    <div className="grid gap-4 p-4">
      {matches.map(match => {
        const property = match.properties as any;
        const primaryMedia = property?.property_media?.find((m: any) => m.is_primary) || property?.property_media?.[0];
        return (
          <Card key={match.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/properties/${property?.id}`)}>
            <div className="flex">
              {primaryMedia && <img src={primaryMedia.url} alt="" className="w-24 h-24 object-cover" />}
              <div className="p-3 flex-1">
                <Badge variant="secondary" className="mb-1">{property?.type}</Badge>
                <p className="font-medium text-sm truncate">{property?.adresse}</p>
                <p className="text-primary font-bold">{property?.prix?.toLocaleString()} {property?.prix_currency}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
