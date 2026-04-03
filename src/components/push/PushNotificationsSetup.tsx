import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Enregistre l’app auprès d’APNs sur iOS natif et synchronise le jeton dans profiles.apns_device_token.
 * Sans effet sur le navigateur ou Android (vérification plateforme).
 */
export function PushNotificationsSetup() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (Capacitor.getPlatform() !== 'ios') return;
    if (user) return;
    void PushNotifications.unregister().catch(() => {});
  }, [user]);

  useEffect(() => {
    if (Capacitor.getPlatform() !== 'ios') return;
    if (loading || !user) return;

    let cancelled = false;
    const handles: Array<{ remove: () => Promise<void> }> = [];

    const run = async () => {
      if (profile?.notif_push === false) {
        await PushNotifications.unregister().catch(() => {});
        await supabase.from('profiles').update({ apns_device_token: null }).eq('id', user.id);
        return;
      }

      const h1 = await PushNotifications.addListener('registration', async ({ value }) => {
        if (cancelled) return;
        await supabase.from('profiles').update({ apns_device_token: value }).eq('id', user.id);
      });
      handles.push(h1);

      const h2 = await PushNotifications.addListener('registrationError', (err) => {
        console.warn('[Push] registration error', err.error);
      });
      handles.push(h2);

      let perm = await PushNotifications.checkPermissions();
      if (perm.receive === 'prompt') {
        perm = await PushNotifications.requestPermissions();
      }
      if (perm.receive !== 'granted' || cancelled) return;

      await PushNotifications.register();
    };

    void run();

    return () => {
      cancelled = true;
      void Promise.all(handles.map((h) => h.remove().catch(() => {})));
    };
  }, [loading, user?.id, profile?.notif_push]);

  return null;
}
