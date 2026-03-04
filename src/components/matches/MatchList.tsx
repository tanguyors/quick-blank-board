import { useMatches } from '@/hooks/useMatches';
import { useMyTransactions } from '@/hooks/useTransaction';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MessageSquare, ArrowRight } from 'lucide-react';
import { TransactionStatusBadge } from '@/components/workflow/TransactionStatus';
import type { TransactionStatus } from '@/types/workflow';
import { useTranslation } from 'react-i18next';
import iconMap from '@/assets/icons/map.png';
import iconHome from '@/assets/icons/home.png';
import iconSearch from '@/assets/icons/search.png';

export function MatchList() {
  const { data: matches, isLoading } = useMatches();
  const { data: transactions } = useMyTransactions();
  const { displayPrice } = useDisplayPrice();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (isLoading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (!matches?.length) return (
    <div className="text-center p-8 text-muted-foreground">{t('property.noMatches')}</div>
  );

  const txByProperty = new Map(
    transactions?.map(tx => [tx.property_id, tx]) || []
  );

  return (
    <div className="grid gap-4 p-4">
      {matches.map(match => {
        const property = match.properties as any;
        const primaryMedia = property?.property_media?.find((m: any) => m.is_primary) || property?.property_media?.[0];
        const tx = txByProperty.get(property?.id);

        return (
          <div key={match.id} className="rounded-2xl overflow-hidden bg-card border border-border">
            <div className="relative">
              {primaryMedia ? (
                <img src={primaryMedia.url} alt="" className="w-full h-56 object-cover cursor-pointer" onClick={() => navigate(`/properties/${property?.id}`)} />
              ) : (
                <div className="w-full h-56 bg-secondary flex items-center justify-center text-muted-foreground">
                  {t('property.noPhoto')}
                </div>
              )}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {tx ? (
                  <TransactionStatusBadge status={tx.status as TransactionStatus} />
                ) : (
                  <span className="bg-background/80 backdrop-blur-sm text-foreground text-xs px-3 py-1 rounded-full font-medium">
                    {t('property.new')}
                  </span>
                )}
                <span className="bg-background/80 backdrop-blur-sm text-foreground text-xs px-3 py-1 rounded-full font-medium">
                  {property?.operations === 'vente' ? t('property.sale') : t('property.rental')}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="bg-secondary/90 backdrop-blur-sm text-foreground font-bold text-lg px-4 py-2 rounded-xl">
                  {property?.prix ? displayPrice(property.prix, property.prix_currency) : ''}
                </span>
                <button onClick={() => navigate(`/properties/${property?.id}`)} className="bg-secondary/90 backdrop-blur-sm text-foreground p-2 rounded-full">
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg text-foreground">{property?.type}</h3>
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{property?.adresse}</span>
              </div>
              <div className="flex gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {property?.chambres}</span>
                <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {property?.salles_bain || 0}</span>
                {property?.surface && (
                  <span className="flex items-center gap-1"><Maximize2 className="h-4 w-4" /> {property?.surface}m²</span>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                {tx ? (
                  <button onClick={() => navigate(`/transaction/${tx.id}`)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                    {t('property.viewTransaction')}
                  </button>
                ) : (
                  <button onClick={() => navigate(`/visits`)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-secondary transition-colors">
                    <CalendarDays className="h-4 w-4" /> {t('property.visit')}
                  </button>
                )}
                <button onClick={() => navigate(`/messages`)} className="w-14 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-secondary transition-colors">
                  <MessageSquare className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
