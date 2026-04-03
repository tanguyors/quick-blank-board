import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { WfNotification } from '@/types/workflow';

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch { /* silent fail */ }
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const prevUnreadRef = useRef<number | null>(null);

  const notifications = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wf_notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as WfNotification[];
    },
    enabled: !!user,
    refetchInterval: 15000,
  });

  const unreadCount = useQuery({
    queryKey: ['notifications-unread-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('wf_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .is('read_at', null);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 15000,
  });

  // Play sound when new notifications arrive
  useEffect(() => {
    const count = unreadCount.data ?? 0;
    if (prevUnreadRef.current !== null && count > prevUnreadRef.current) {
      playNotificationSound();
    }
    prevUnreadRef.current = count;
  }, [unreadCount.data]);

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('wf_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('wf_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user!.id)
        .is('read_at', null);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const deleteRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('wf_notifications')
        .delete()
        .eq('user_id', user!.id)
        .not('read_at', 'is', null);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const deleteOne = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('wf_notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  return { notifications, unreadCount, markAsRead, markAllAsRead, deleteRead, deleteOne };
}
