import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import iconExchange from '@/assets/icons/exchange.png';

export default function ExchangeRequests() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<'received' | 'sent'>('received');

  // Get conversations related to exchange properties
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['exchange-conversations', user?.id],
    queryFn: async () => {
      // Get all conversations where user is involved
      // Step 1: Get all conversations for user
      const { data: convs, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`buyer_id.eq.${user!.id},owner_id.eq.${user!.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      if (!convs || convs.length === 0) return [];

      // Step 2: Get properties for these conversations
      const propertyIds = [...new Set(convs.map((c: any) => c.property_id).filter(Boolean))];
      const { data: props } = await supabase
        .from('properties')
        .select('id, type, adresse, operations, owner_id, property_media(url, is_primary)')
        .in('id', propertyIds);

      // Step 3: Filter exchange only
      const exchangePropIds = (props || []).filter((p: any) => p.operations === 'home_exchange').map((p: any) => p.id);
      const exchangeConvs = convs.filter((c: any) => exchangePropIds.includes(c.property_id));

      if (exchangeConvs.length === 0) return [];

      // Step 4: Enrich with profiles
      const otherIds = [...new Set(exchangeConvs.map((c: any) => c.buyer_id === user!.id ? c.owner_id : c.buyer_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', otherIds);

      return exchangeConvs.map((c: any) => ({
        ...c,
        property: (props || []).find((p: any) => p.id === c.property_id) || null,
        otherProfile: (profiles || []).find((p: any) => p.id === (c.buyer_id === user!.id ? c.owner_id : c.buyer_id)) || null,
      }));
    },
    enabled: !!user,
  });

  const received = (conversations || []).filter((c: any) => c.property?.owner_id === user?.id);
  const sent = (conversations || []).filter((c: any) => c.property?.owner_id !== user?.id);
  const displayed = tab === 'received' ? received : sent;

  return (
    <AppLayout hideHeader>
      <PageTopBar>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/home-exchange')} className="text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <img src={iconExchange} alt="" className="h-6 w-6 object-contain" />
          <span className="font-semibold text-foreground">{t('exchangeNav.requests')}</span>
        </div>
      </PageTopBar>

      <div className="p-4 space-y-4 pb-nav-scroll">
        {/* Tabs */}
        <div className="flex bg-secondary rounded-full p-1">
          <button
            onClick={() => setTab('received')}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${tab === 'received' ? 'bg-foreground text-background' : 'text-muted-foreground'}`}
          >
            {t('exchangeNav.received')} {received.length > 0 && `(${received.length})`}
          </button>
          <button
            onClick={() => setTab('sent')}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${tab === 'sent' ? 'bg-foreground text-background' : 'text-muted-foreground'}`}
          >
            {t('exchangeNav.sent')} {sent.length > 0 && `(${sent.length})`}
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : displayed.length > 0 ? (
          <div className="space-y-3">
            {displayed.map((conv: any) => {
              const otherUser = conv.otherProfile;
              const media = conv.property?.property_media?.find((m: any) => m.is_primary) || conv.property?.property_media?.[0];

              return (
                <div
                  key={conv.id}
                  className="bg-card rounded-xl border border-border p-3 flex items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => navigate(`/messages/${conv.id}`, { state: { from: '/home-exchange/requests' } })}
                >
                  {media ? (
                    <img src={media.url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <img src={iconExchange} alt="" className="h-6 w-6 object-contain opacity-50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {otherUser?.full_name || 'Utilisateur'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.property?.type} — {conv.property?.adresse}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <MessageCircle className="h-3 w-3 text-primary" />
                      <span className="text-xs text-primary">{t('exchangeNav.proposeExchange')}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <img src={iconExchange} alt="" className="h-12 w-12 object-contain mx-auto mb-3 opacity-50" />
            <p className="text-sm">{t('exchangeNav.noRequests')}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
