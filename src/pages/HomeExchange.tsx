import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, RefreshCw, Shield, Info } from 'lucide-react';

import iconMap from '@/assets/icons/map.png';
import iconHome from '@/assets/icons/lit.png';

export default function HomeExchange() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { displayPrice } = useDisplayPrice();

  // Fetch all home_exchange properties
  const { data: properties, isLoading } = useQuery({
    queryKey: ['home-exchange-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*, property_media(url, is_primary, position)')
        .eq('operations', 'home_exchange')
        .eq('is_published', true)
        .eq('status', 'available')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch current user's properties (to check if they have one to exchange)
  const { data: myProperties } = useQuery({
    queryKey: ['my-properties-for-exchange', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, type, adresse, operations')
        .eq('owner_id', user!.id)
        .eq('is_published', true);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const hasProperty = myProperties && myProperties.length > 0;

  return (
    <AppLayout>
      <PageTopBar>
        <span className="text-lg font-semibold text-foreground">Home Exchange</span>
      </PageTopBar>

      <div className="p-4 space-y-6">
        {/* Hero section */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-6 border border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Home Exchange</h2>
              <p className="text-sm text-muted-foreground">Échangez votre maison</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Échangez votre bien avec un autre propriétaire. Simple, direct et flexible.
            SomaGate vous met en relation — vous gérez les modalités entre vous.
          </p>
        </div>

        {/* How it works */}
        <div className="bg-card rounded-xl p-4 border border-border space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            Comment ça marche ?
          </h3>
          <div className="space-y-2">
            {[
              { step: '1', text: 'Publiez votre bien en sélectionnant "Home Exchange" comme opération' },
              { step: '2', text: 'Parcourez les biens disponibles à l\'échange' },
              { step: '3', text: 'Likez un bien — si le propriétaire est intéressé, c\'est un match !' },
              { step: '4', text: 'Convenez ensemble des modalités : durée, période, ajustements éventuels' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.step}
                </span>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security notice */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <Shield className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Échangez en toute sécurité</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tous les échanges et conversations sont enregistrés sur SomaGate.
              En cas de litige, l'historique complet est conservé.
              Nous recommandons de convenir par écrit des conditions de l'échange via la messagerie SomaGate.
            </p>
          </div>
        </div>

        {/* CTA if user has no property */}
        {!hasProperty && (
          <div className="bg-secondary/50 rounded-xl p-4 border border-border text-center space-y-3">
            <Home className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Pour proposer un échange, vous devez d'abord publier un bien.
            </p>
            <Button onClick={() => navigate('/properties/new')} size="sm">
              Publier mon bien
            </Button>
          </div>
        )}

        {/* Properties available for exchange */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">
            Biens disponibles à l'échange
            {properties && <span className="text-muted-foreground font-normal ml-2 text-sm">({properties.length})</span>}
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : properties && properties.length > 0 ? (
            <div className="space-y-3">
              {properties.map(property => {
                const media = property.property_media?.find((m: any) => m.is_primary) || property.property_media?.[0];
                const isOwn = property.owner_id === user?.id;

                return (
                  <div
                    key={property.id}
                    className="bg-card rounded-xl border border-border overflow-hidden flex cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => navigate(`/properties/${property.id}`)}
                  >
                    {media ? (
                      <img src={media.url} alt="" className="w-28 h-28 object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-28 h-28 bg-secondary flex items-center justify-center flex-shrink-0">
                        <Home className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="p-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          {property.type}
                        </span>
                        <span className="text-xs font-medium bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">
                          Home Exchange
                        </span>
                        {isOwn && (
                          <span className="text-xs font-medium bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                            Mon bien
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground mt-1">
                        <img src={iconMap} alt="" className="h-3 w-3 object-contain" />
                        <span className="text-xs truncate">{property.adresse}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <img src={iconHome} alt="" className="h-3 w-3 object-contain" /> {property.chambres}
                        </span>
                        <span>🚿 {property.salles_bain}</span>
                        {property.surface && <span>{property.surface}m²</span>}
                      </div>
                      {property.exchange_duration && (
                        <p className="text-xs text-primary mt-1 font-medium">
                          Durée : {property.exchange_duration}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center pr-3">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <RefreshCw className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Aucun bien disponible à l'échange pour le moment.</p>
              <p className="text-xs mt-1">Soyez le premier à proposer le vôtre !</p>
            </div>
          )}
        </div>

        {/* Browse via swipe */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/explore?operation=home_exchange')}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Explorer en mode swipe
        </Button>
      </div>
    </AppLayout>
  );
}
