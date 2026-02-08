import { AppLayout } from '@/components/layout/AppLayout';
import { PageTopBar } from '@/components/layout/PageTopBar';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

export default function Notifications() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <AppLayout hideHeader>
      <PageTopBar>
        <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
          <Bell className="h-4 w-4 text-primary" />
          <span className="text-foreground font-semibold">Notifications</span>
        </div>
      </PageTopBar>
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <span />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            <CheckCheck className="h-4 w-4 mr-1" /> Tout lire
          </Button>
        </div>

        {notifications.isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : !notifications.data?.length ? (
          <div className="text-center p-8">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.data.map(notif => (
              <button
                key={notif.id}
                onClick={() => {
                  if (!notif.read_at) markAsRead.mutate(notif.id);
                  if (notif.action_url) navigate(notif.action_url);
                }}
                className={`w-full text-left rounded-xl p-4 border transition-colors ${
                  notif.read_at
                    ? 'bg-card border-border'
                    : 'bg-primary/5 border-primary/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{notif.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                  </div>
                  {!notif.read_at && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(notif.created_at), "dd MMM 'à' HH:mm", { locale: fr })}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
